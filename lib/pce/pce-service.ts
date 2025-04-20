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
import {
  shouldTriggerBootstrapping,
  generateBootstrappingPrompt,
  isAwaitingBootstrapResponse,
  processBootstrapResponse,
} from "@/lib/bootstrap/bootstrap-service";
import type { EWEFAnalysisOutput, BootstrappedEP, RuleVariables, PInstanceData } from "../types/pce-types";
import { analyzeSentiment } from "../transformers/sentiment-service";
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
import { calculateLinearVad } from "./ewef-core-engine/linear-model";
import type { NlpFeatures, SentimentLabel } from "../types/nlp-types";
import { getMinimalContext } from "./context-analyzer";
import { appraisePerception } from "./perception-appraisal";
import { calculateAnalysisConfidenceV1 } from './confidence-scorer'

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
 * Process a PCE MVP request (MVP version)
 *
 * @param input Input data containing userID, sessionID, and utteranceText
 * @param options Optional processing options
 * @returns EWEFAnalysisOutput containing VAD, state, activeEPs, pInstance, and ruleVariables
 */
export async function processPceMvpRequest(
  input: { userID: string; sessionID: string; utteranceText: string },
  options: { useLlmAssistance?: boolean } = {},
): Promise<EWEFAnalysisOutput> {
  try {
    // Step 1: Get NLP features from the utterance
    const nlpFeatures = await getCoreNlpFeatures(input.utteranceText)

    // Step 2: Use simple heuristics for MVP (no context, no bootstrapped EPs)
    const activeBootstrappedEPs: BootstrappedEP[] = []

    // Step 3: Minimal rule variables (MVP defaults)
    const ruleVariables: RuleVariables = {
      source: { value: "external", confidence: 0.5 },
      perspective: { value: "self", confidence: 0.5 },
      timeframe: { value: "present", confidence: 0.5 },
      acceptanceState: { value: "uncertain", confidence: 0.5 },
    }

    // Step 4: Minimal pInstance (MVP defaults)
    const pInstance: PInstanceData = {
      mhhSource: "external",
      mhhPerspective: "self",
      mhhTimeframe: "present",
      mhhAcceptanceState: "uncertain",
      pValuationShiftEstimate: 0.0,
      pPowerLevel: 0.5,
      pAppraisalConfidence: 0.5,
    }

    // Step 5: Calculate VAD using the linear model
    const vad = calculateLinearVad(pInstance, ruleVariables, activeBootstrappedEPs, nlpFeatures.sentiment.score)

    // Step 6: Minimal state (stub for MVP)
    const state = {
      timestamp: Date.now(),
      moodEstimate: vad.valence,
      stressEstimate: vad.arousal,
    }

    // Return the complete EWEF analysis output
    return {
      vad,
      state,
      activeEPs: activeBootstrappedEPs,
      pInstance,
      ruleVariables,
      analysisConfidence: 0.3, // Added default low confidence for MVP
    }
  } catch (error) {
    // Use console.error for errors in MVP
    console.error(`Error in processPceMvpRequest: ${error}`)
    // Return default values on error
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
      analysisConfidence: 0.1, // Added default low confidence for MVP error case
    }
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
      analysisConfidence: 0.3, // Added default low confidence for simplified path
    };
  } catch (error) {
    logger.error(`Error in performSimplifiedEwefAnalysis: ${error instanceof Error ? error.message : error}`);
    return createDefaultEwefOutput(); // This already includes default confidence
  }
}

/**
 * Create a default EWEF output with default confidence
 * @returns Default EWEF output
 */
function createDefaultEwefOutput(): EWEFAnalysisOutput {
  // Note: Even default output should have a confidence score, likely low.
  const defaultOutputBase = {
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
      mhhSource: "external" as const,
      mhhPerspective: "self" as const,
      mhhTimeframe: "present" as const,
      mhhAcceptanceState: "uncertain" as const,
      pValuationShiftEstimate: 0.0,
      pPowerLevel: 0.5,
      pAppraisalConfidence: 0.5,
    },
    ruleVariables: {
      source: { value: "external" as const, confidence: 0.5 },
      perspective: { value: "self" as const, confidence: 0.5 },
      timeframe: { value: "present" as const, confidence: 0.5 },
      acceptanceState: { value: "uncertain" as const, confidence: 0.5 },
    },
    emotionCategorization: undefined,
    analysisConfidence: 0.1, // Explicitly set low confidence for default
  };
  // We need to ensure the type matches EWEFAnalysisOutput, including analysisConfidence
  // In this case, we are setting a low default, no need to calculate on defaults.
  return defaultOutputBase;
}

/**
 * Perform EWEF analysis using the full V1 pipeline.
 * @param userID The user's ID.
 * @param sessionID The session ID.
 * @param utteranceText The user's utterance.
 * @returns EWEFAnalysisOutput
 */
export async function performEwefAnalysis(
  userID: string,
  sessionID: string,
  utteranceText: string
): Promise<EWEFAnalysisOutput> {
  try {
    // Step 1: NLP features
    const nlpFeatures = await getCoreNlpFeatures(utteranceText);
    // Step 2: Minimal context (EPs, userState, profiles undefined)
    const context = await getMinimalContext(
      userID,
      nlpFeatures.keywords,
      nlpFeatures.entities,
      nlpFeatures.abstractConcepts
    );
    // Step 3: Appraise perception (heuristic for V1)
    const pInstance = await appraisePerception(
      utteranceText,
      nlpFeatures,
      context.activeEPs,
      context,
      false, // useLlmAssistance = false for MVP
      context.userState,
      context.culturalContext,
      context.personality
    );
    if (!pInstance) {
      logger.error("Appraisal failed in PCE pipeline");
      throw new Error("Appraisal failed");
    }
    // Step 4: Extract ruleVariables from pInstance
    const ruleVariables = {
      source: { value: pInstance.mhhSource, confidence: 0.7 },
      perspective: { value: pInstance.mhhPerspective, confidence: 0.7 },
      timeframe: { value: pInstance.mhhTimeframe, confidence: 0.7 },
      acceptanceState: { value: pInstance.mhhAcceptanceState, confidence: 0.7 },
    };
    // Step 5: Calculate VAD
    const vad = calculateLinearVad(
      pInstance,
      ruleVariables,
      context.activeEPs,
      nlpFeatures.sentiment.score,
      context.userState,
      context.culturalContext,
      context.personality
    );
    // Step 6: Update state (minimal for V1)
    const state = {
      timestamp: Date.now(),
      moodEstimate: vad.valence,
      stressEstimate: vad.arousal,
    };
    // Step 7: Emotion categorization
    const emotionCategorizationRaw = await categorizeEmotion(
      context,
      ruleVariables,
      pInstance,
      vad
    );
    const emotionCategorization = emotionCategorizationRaw
      ? {
          ...emotionCategorizationRaw,
          categoryDistribution: Object.fromEntries(
            emotionCategorizationRaw.categoryDistribution.map(cat => [
              cat.label,
              cat.probability,
            ])
          ),
        }
      : undefined;

    // Step 8: Construct partial analysis output before confidence calculation
    const analysisOutputBase: Omit<EWEFAnalysisOutput, 'analysisConfidence'> = {
      vad,
      state,
      activeEPs: context.activeEPs,
      pInstance,
      ruleVariables,
      emotionCategorization,
    };

    // Step 9: Calculate V1 Analysis Confidence (Integrity Layer V1)
    const analysisConfidence = calculateAnalysisConfidenceV1({
      ...analysisOutputBase,
      analysisConfidence: 0, // Provide a dummy value, it will be overwritten
    });

    // Step 10: Return full EWEFAnalysisOutput including confidence
    const finalAnalysisOutput: EWEFAnalysisOutput = {
      ...analysisOutputBase,
      analysisConfidence,
    };

    // Optional: Conditionally log detailed analysis
    // FIXME: This function needs more context (userId, sessionId, interactionId, etc.)
    //        which is not readily available here. Consider moving this call to the API route.
    // await conditionallyLogDetailedAnalysis(finalAnalysisOutput);

    return finalAnalysisOutput;
  } catch (error) {
    logger.error(
      `Error in performEwefAnalysis: ${error instanceof Error ? error.stack || error.message : error}`
    );
    // Return default values on error, including default low confidence
    return createDefaultEwefOutput(); // Uses the updated default creator
  }
}

/**
 * Map sentiment label from the sentiment-service to the canonical SentimentLabel type.
 * Handles lowercase/uppercase and fallback.
 */
function normalizeSentimentLabel(label: string | undefined): SentimentLabel {
  if (!label) return "NEUTRAL"; // Handle undefined case
  switch (label.toLowerCase()) {
    case "positive":
      return "POSITIVE";
    case "negative":
      return "NEGATIVE";
    case "neutral":
      return "NEUTRAL";
    default:
      return "NEUTRAL"; // Fallback to neutral
  }
}
