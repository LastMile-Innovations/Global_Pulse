import { KgService } from "../db/graph/kg-service";
import { getNeo4jDriver } from "../db/graph/neo4j-driver";
import { logger } from "../utils/logger";
import { getEngagementMode } from "../session/mode-manager";
import { shouldLogDetailedEwef } from "./conditional-logging";
import {
  shouldTriggerDistressCheckin,
  generateDistressCheckin,
  handleDistressCheckinResponse,
} from "../distress/distress-detection";
import { isAwaitingDistressCheckResponse } from "../session/session-state";
import { v4 as uuidv4 } from "uuid";
import { getRedisClient } from "@/lib/db/redis/redis-client";
import {
  shouldTriggerBootstrapping,
  generateBootstrappingPrompt,
  isAwaitingBootstrapResponse,
  processBootstrapResponse,
} from "@/lib/bootstrap/bootstrap-service";
import type { EWEFAnalysisOutput, BootstrappedEP } from "@/lib/types/pce-types";
import { analyzeSentiment } from "../utils/sentiment-analysis";
import { conditionallyLogDetailedAnalysis } from "./conditional-logging";
import { getCoreNlpFeatures } from "../nlp/nlp-features";
import { inferSelfMapAttachments, updateSelfMapWithInferences } from "./self-map-inference";
import {
  shouldTriggerSomaticPrompt,
  generateSomaticPrompt,
  isAwaitingSomaticResponse,
  generateSomaticAcknowledgment,
} from "../somatic/somatic-service";
import { categorizeEmotion } from "./emotion-categorization";
import { generateExplanation } from "./metacognition";
import { generateInteractionGuidance } from "./interaction-guidance";

// Redis key for tracking turn count
const REDIS_KEY_TURN_COUNT = "session:turn_count:";

// Session TTL in seconds (24 hours)
const SESSION_TTL = 86400;

// Minimum certainty threshold for MHH variable inference
const MHH_VARIABLE_MIN_CERTAINTY = 0.6;

// Default power level for perception appraisal
const DEFAULT_POWER_LEVEL = 0.5;

interface PceServiceInput {
  userID: string;
  sessionID: string;
  utteranceText: string;
  currentMode?: "insight" | "listening";
  currentTurn?: number;
}

interface PceServiceResult {
  agentResponse: string;
  ewefAnalysis: EWEFAnalysisOutput;
  interactionId: string;
  responseDelay?: number;
  responseSource?: string;
}

/**
 * Process a PCE MVP request
 * @param params Request parameters
 * @param options Processing options
 * @returns Processing result
 */
export async function processPceMvpRequest(
  params: {
    userID: string;
    sessionID: string;
    utteranceText: string;
  },
  options: {
    useLlmAssistance?: boolean;
    currentTurn?: number;
    inferSelfMap?: boolean;
  } = {},
): Promise<{
  ewefAnalysis: EWEFAnalysisOutput;
  response: string;
  interactionId: string;
  responseDelay?: number;
  responseSource?: string;
}> {
  const { userID, sessionID, utteranceText } = params;
  const { useLlmAssistance = true, inferSelfMap = true } = options;

  let isListeningMode = false;

  try {
    // Get or initialize turn count
    const currentTurn = options.currentTurn ?? (await getTurnCount(sessionID));

    // Increment turn count for next interaction
    await incrementTurnCount(sessionID);

    // Initialize Neo4j driver and KgService
    const driver = getNeo4jDriver();
    const kgService = new KgService(driver);

    // Generate a unique interaction ID
    const interactionId = uuidv4();

    // Log the basic interaction (always done regardless of consent or mode)
    await kgService.logInteraction({
      userID,
      sessionID,
      userInput: utteranceText,
      agentResponse: "", // Will be filled in later
      interactionType: "chat",
    });

    // Get the current engagement mode
    const currentMode = await getEngagementMode(userID, sessionID);
    isListeningMode = currentMode === "listening";

    // Check if we're awaiting a bootstrap response
    const awaitingBootstrap = await isAwaitingBootstrapResponse(userID, sessionID);
    if (awaitingBootstrap) {
      logger.info(`Processing bootstrap response for User ${userID}, Session ${sessionID}`);
      const ackResponse = await processBootstrapResponse(userID, sessionID, utteranceText);

      // Update the interaction with the response
      await kgService.setInteractionProperty(interactionId, "agentResponse", ackResponse);
      await kgService.setInteractionProperty(interactionId, "responseType", "bootstrap_ack");

      // Return the acknowledgment, skipping normal EWEF pipeline
      return {
        ewefAnalysis: createDefaultEwefOutput(),
        response: ackResponse,
        interactionId,
        responseDelay: 500,
        responseSource: "template_bootstrap_ack",
      };
    }

    // Check if we're awaiting a somatic response
    const awaitingSomatic = await isAwaitingSomaticResponse(userID, sessionID);
    if (awaitingSomatic) {
      logger.info(`Processing somatic response for User ${userID}, Session ${sessionID}`);
      const ackResponse = await generateSomaticAcknowledgment(userID, sessionID);

      // Update the interaction with the response
      await kgService.setInteractionProperty(interactionId, "agentResponse", ackResponse);
      await kgService.setInteractionProperty(interactionId, "responseType", "somatic_ack");

      return {
        ewefAnalysis: createDefaultEwefOutput(),
        response: ackResponse,
        interactionId,
        responseDelay: 500,
        responseSource: "template_somatic_ack",
      };
    }

    // Check if we're awaiting a distress check-in response
    const awaitingDistressResponse = await isAwaitingDistressCheckResponse(sessionID);
    if (awaitingDistressResponse) {
      logger.info(`Processing distress check-in response for User ${userID}, Session ${sessionID}`);
      const ackResponse = await handleDistressCheckinResponse(userID, sessionID, utteranceText);

      // Update the interaction with the response
      await kgService.setInteractionProperty(interactionId, "agentResponse", ackResponse);
      await kgService.setInteractionProperty(interactionId, "responseType", "distress_ack");

      return {
        ewefAnalysis: createDefaultEwefOutput(),
        response: ackResponse,
        interactionId,
        responseDelay: 500,
        responseSource: "template_distress_ack",
      };
    }

    // Check if we should trigger bootstrapping
    const triggerBootstrap = await shouldTriggerBootstrapping(userID, sessionID, currentTurn);
    if (triggerBootstrap) {
      const bootstrapPrompt = await generateBootstrappingPrompt(userID, sessionID);

      // Update the interaction with the response
      await kgService.setInteractionProperty(interactionId, "agentResponse", bootstrapPrompt);
      await kgService.setInteractionProperty(interactionId, "responseType", "bootstrap_prompt");

      // Return this prompt as the agent response, skipping normal EWEF pipeline for this turn
      return {
        ewefAnalysis: createDefaultEwefOutput(),
        response: bootstrapPrompt,
        interactionId,
        responseDelay: 500,
        responseSource: "template_bootstrap_prompt",
      };
    }

    // Get NLP features with embeddings if inferring self-map
    let nlpFeatures: any = {};
    try {
      nlpFeatures = await getCoreNlpFeatures(utteranceText, {
        includeEmbedding: inferSelfMap,
      });
    } catch (err) {
      logger.error(`Error getting NLP features: ${err instanceof Error ? err.message : err}`);
      nlpFeatures = {};
    }

    // Infer self-map attachments if enabled
    if (inferSelfMap) {
      try {
        logger.info(`Inferring self-map attachments for User ${userID}`);
        const inferences = await inferSelfMapAttachments(utteranceText, nlpFeatures, userID);

        if (inferences && inferences.length > 0) {
          logger.info(`Inferred ${inferences.length} self-map attachments`);

          // Update the user's self-map with the inferences
          await updateSelfMapWithInferences(userID, inferences, interactionId);
        }
      } catch (error) {
        logger.error(`Error inferring self-map: ${error instanceof Error ? error.message : error}`);
        // Continue with the rest of the processing
      }
    }

    // Retrieve bootstrapped attachments if available
    let activeBootstrappedEPs: BootstrappedEP[] = [];
    try {
      // TODO: Implement retrieval of user's bootstrapped EPs
      // For MVP, we'll use an empty array
      activeBootstrappedEPs = [];
    } catch (error) {
      logger.error(`Error retrieving bootstrapped attachments: ${error instanceof Error ? error.message : error}`);
      activeBootstrappedEPs = [];
    }

    // Perform EWEF analysis
    const ewefAnalysis = await performEwefAnalysis(utteranceText, nlpFeatures, activeBootstrappedEPs);

    // -------------------------------------------------------------------------
    // STEP 7: Emotion Categorization (Integration Point)
    // -------------------------------------------------------------------------

    // Categorize emotion using the integrated Webb/VAD approach
    let emotionCategorization: any = null;
    try {
      emotionCategorization = categorizeEmotion(
        ewefAnalysis.ruleVariables,
        ewefAnalysis.pInstance,
        ewefAnalysis.vad,
        0.7, // Example power level
      );
      // Add the emotion categorization to the EWEF analysis
      (ewefAnalysis as any).emotionCategorization = emotionCategorization;

      // Log the emotion categorization results
      logger.info(`Emotion categorization results:`, {
        primaryLabel: emotionCategorization.primaryLabel,
        emotionGroup: emotionCategorization.emotionGroup,
        categoryDistribution: emotionCategorization.categoryDistribution,
      });
    } catch (err) {
      logger.error(`Error in emotion categorization: ${err instanceof Error ? err.message : err}`);
      (ewefAnalysis as any).emotionCategorization = null;
    }

    // -------------------------------------------------------------------------
    // STEP 8: Generate Explanation (Metacognitive Layer Adaptation)
    // -------------------------------------------------------------------------

    // Generate an explanation for the EWEF analysis
    let explanation: string = "";
    try {
      explanation = await generateExplanation(ewefAnalysis);
      // Log the explanation
      logger.info(`Generated explanation: ${explanation}`);
      (ewefAnalysis as any).explanation = explanation;
    } catch (err) {
      logger.error(`Error generating explanation: ${err instanceof Error ? err.message : err}`);
      (ewefAnalysis as any).explanation = "";
    }

    // -------------------------------------------------------------------------
    // STEP 9: Generate Interaction Guidance (Interaction Guidance Module Adaptation)
    // -------------------------------------------------------------------------

    // Generate interaction guidance based on the EWEF analysis
    let interactionGuidance: any = null;
    try {
      interactionGuidance = generateInteractionGuidance(
        ewefAnalysis.vad,
        (ewefAnalysis as any).emotionCategorization,
        ewefAnalysis.pInstance,
        ewefAnalysis.ruleVariables,
      );
      (ewefAnalysis as any).interactionGuidance = interactionGuidance;
      // Log the interaction guidance
      logger.info(`Generated interaction guidance: ${interactionGuidance.primaryDialogueAct}`);
    } catch (err) {
      logger.error(`Error generating interaction guidance: ${err instanceof Error ? err.message : err}`);
      (ewefAnalysis as any).interactionGuidance = null;
    }

    // Check if we should trigger a somatic prompt
    let shouldTriggerSomatic = false;
    try {
      shouldTriggerSomatic = await shouldTriggerSomaticPrompt(userID, sessionID, ewefAnalysis.vad, currentTurn);
    } catch (err) {
      logger.error(`Error checking shouldTriggerSomaticPrompt: ${err instanceof Error ? err.message : err}`);
    }
    if (shouldTriggerSomatic) {
      try {
        const somaticPrompt = await generateSomaticPrompt(userID, sessionID, utteranceText, ewefAnalysis.vad, currentTurn);

        if (somaticPrompt) {
          // Update the interaction with the response
          await kgService.setInteractionProperty(interactionId, "agentResponse", somaticPrompt);
          await kgService.setInteractionProperty(interactionId, "responseType", "somatic_prompt");

          return {
            ewefAnalysis,
            response: somaticPrompt,
            interactionId,
            responseDelay: 500,
            responseSource: "template_somatic_prompt",
          };
        }
      } catch (err) {
        logger.error(`Error generating somatic prompt: ${err instanceof Error ? err.message : err}`);
      }
    }

    // Check if we should trigger a distress check-in
    let shouldLogDetails = false;
    try {
      shouldLogDetails = await shouldLogDetailedEwef(userID, sessionID);
    } catch (err) {
      logger.error(`Error checking shouldLogDetailedEwef: ${err instanceof Error ? err.message : err}`);
    }
    let shouldTriggerDistress = false;
    try {
      shouldTriggerDistress = await shouldTriggerDistressCheckin(
        userID,
        sessionID,
        ewefAnalysis.vad,
        currentTurn,
        shouldLogDetails,
      );
    } catch (err) {
      logger.error(`Error checking shouldTriggerDistressCheckin: ${err instanceof Error ? err.message : err}`);
    }
    if (shouldTriggerDistress) {
      try {
        const distressPrompt = await generateDistressCheckin(userID, sessionID);

        // Update the interaction with the response
        await kgService.setInteractionProperty(interactionId, "agentResponse", distressPrompt);
        await kgService.setInteractionProperty(interactionId, "responseType", "distress_prompt");

        return {
          ewefAnalysis,
          response: distressPrompt,
          interactionId,
          responseDelay: 500,
          responseSource: "template_distress_prompt",
        };
      } catch (err) {
        logger.error(`Error generating distress check-in: ${err instanceof Error ? err.message : err}`);
      }
    }

    // Conditionally log detailed EWEF analysis based on consent and mode
    try {
      await conditionallyLogDetailedAnalysis({
        userId: userID,
        sessionId: sessionID,
        interactionId,
        currentMode,
        kgService,
        stateData: ewefAnalysis.state,
        perceptionData: ewefAnalysis.pInstance,
        reactionData: {
          valence: ewefAnalysis.vad.valence,
          arousal: ewefAnalysis.vad.arousal,
          dominance: ewefAnalysis.vad.dominance,
          confidence: ewefAnalysis.vad.confidence,
        },
      });
    } catch (err) {
      logger.error(`Error in conditionallyLogDetailedAnalysis: ${err instanceof Error ? err.message : err}`);
    }

    // Log the analysis results
    logger.info(`EWEF analysis for user ${userID}:`, {
      valence: ewefAnalysis.vad.valence,
      arousal: ewefAnalysis.vad.arousal,
      dominance: ewefAnalysis.vad.dominance,
    });

    // TODO: Replace placeholder response with actual chat API integration
    return {
      ewefAnalysis,
      response: "This is a placeholder response",
      interactionId,
      responseDelay: undefined,
      responseSource: isListeningMode ? "listening_ack" : "normal_processing",
    };
  } catch (error) {
    logger.error(`Error in processPceMvpRequest: ${error instanceof Error ? error.message : error}`);

    // Return default values on error
    return {
      ewefAnalysis: createDefaultEwefOutput(),
      response: "I understand. Let's continue our conversation.",
      interactionId: uuidv4(),
      responseDelay: 500,
      responseSource: "error_fallback",
    };
  }
}

/**
 * Perform simplified EWEF analysis for MVP
 * @param text The text to analyze
 * @returns EWEF analysis output
 */
async function performSimplifiedEwefAnalysis(text: string): Promise<EWEFAnalysisOutput> {
  try {
    // For MVP, use a simple sentiment analysis to approximate VAD
    const sentiment = await analyzeSentiment(text);

    // Map sentiment to VAD values
    // Valence: directly map from sentiment score (-1 to 1)
    const valence = typeof sentiment.score === "number" ? sentiment.score : 0;

    // Arousal: use sentiment magnitude (0 to 1)
    // Higher magnitude means stronger emotion (higher arousal)
    const arousal = Math.min(Math.abs(typeof sentiment.magnitude === "number" ? sentiment.magnitude : 0), 1);

    // Dominance: for MVP, use a neutral value with slight adjustment based on text
    // More assertive language might indicate higher dominance
    let dominance = 0.5;
    if (typeof text === "string") {
      if (text.includes("!")) dominance += 0.1;
      if (text.includes("?")) dominance -= 0.1;
    }

    // Clamp dominance between 0 and 1
    dominance = Math.max(0, Math.min(1, dominance));

    // Create the EWEF analysis output
    return {
      vad: {
        valence,
        arousal,
        dominance,
        confidence: 0.7, // Medium confidence for MVP
      },
      state: {
        timestamp: Date.now(),
        moodEstimate: valence, // Use valence as mood estimate
        stressEstimate: arousal > 0.5 && valence < 0 ? arousal : 0.1, // High arousal + negative valence = stress
      },
      activeEPs: [], // Empty for MVP
      pInstance: {
        mhhSource: "external",
        mhhPerspective: "self",
        mhhTimeframe: "present",
        mhhAcceptanceState: "uncertain",
        pValuationShiftEstimate: 0.0,
        pPowerLevel: 0.5,
        pAppraisalConfidence: 0.5,
      },
      ruleVariables: {
        source: { value: "external", confidence: 0.5 },
        perspective: { value: "self", confidence: 0.5 },
        timeframe: { value: "present", confidence: 0.5 },
        acceptanceState: { value: "uncertain", confidence: 0.5 },
      },
    };
  } catch (error) {
    logger.error(`Error in performSimplifiedEwefAnalysis: ${error instanceof Error ? error.message : error}`);
    return createDefaultEwefOutput();
  }
}

/**
 * Create a default EWEF output
 * @returns Default EWEF output
 */
function createDefaultEwefOutput(): EWEFAnalysisOutput {
  return {
    vad: {
      valence: 0.0,
      arousal: 0.1,
      dominance: 0.0,
      confidence: 0.5,
    },
    state: {
      timestamp: Date.now(),
      moodEstimate: 0.0,
      stressEstimate: 0.1,
    },
    activeEPs: [],
    pInstance: {
      mhhSource: "external",
      mhhPerspective: "self",
      mhhTimeframe: "present",
      mhhAcceptanceState: "uncertain",
      pValuationShiftEstimate: 0.0,
      pPowerLevel: 0.5,
      pAppraisalConfidence: 0.5,
    },
    ruleVariables: {
      source: { value: "external", confidence: 0.5 },
      perspective: { value: "self", confidence: 0.5 },
      timeframe: { value: "present", confidence: 0.5 },
      acceptanceState: { value: "uncertain", confidence: 0.5 },
    },
  };
}

async function getTurnCount(sessionID: string): Promise<number> {
  const redis = getRedisClient();
  const key = `${REDIS_KEY_TURN_COUNT}${sessionID}`;
  try {
    const turnCount = await redis.get(key);
    return turnCount ? Number.parseInt(turnCount, 10) : 0;
  } catch (error) {
    logger.error(`Error getting turn count for session ${sessionID}: ${error instanceof Error ? error.message : error}`);
    return 0;
  }
}

async function incrementTurnCount(sessionID: string): Promise<void> {
  const redis = getRedisClient();
  const key = `${REDIS_KEY_TURN_COUNT}${sessionID}`;
  try {
    await redis.incr(key);
    await redis.expire(key, SESSION_TTL);
  } catch (error) {
    logger.error(`Error incrementing turn count for session ${sessionID}: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Perform EWEF analysis using available NLP features and bootstrapped EPs.
 * @param utteranceText The user's utterance.
 * @param nlpFeatures NLP features for the utterance.
 * @param activeBootstrappedEPs User's bootstrapped EPs.
 * @returns EWEFAnalysisOutput
 */
async function performEwefAnalysis(
  utteranceText: string,
  nlpFeatures: any,
  activeBootstrappedEPs: BootstrappedEP[],
): Promise<EWEFAnalysisOutput> {
  // TODO: Replace with actual EWEF logic using nlpFeatures and activeBootstrappedEPs
  // For now, fallback to simplified analysis
  return await performSimplifiedEwefAnalysis(utteranceText);
}
