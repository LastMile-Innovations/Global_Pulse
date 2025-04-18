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
  // MVP: If bootstrapped EPs are available, try to use them to enrich the analysis
  // For now, fallback to simplified analysis, but attach bootstrapped EPs if present
  const base = await performSimplifiedEwefAnalysis(utteranceText);
  if (Array.isArray(activeBootstrappedEPs) && activeBootstrappedEPs.length > 0) {
    base.activeEPs = activeBootstrappedEPs;
  }
  return base;
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
