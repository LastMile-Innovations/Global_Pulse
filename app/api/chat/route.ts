import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-utils";
import { logger } from "@/lib/utils/logger";
import { processPceMvpRequest } from "@/lib/pce/pce-service";
import { getRedisClient } from "@/lib/db/redis/redis-client";
import { v4 as uuidv4 } from "uuid";
import { detectUncertainty } from "@/lib/nlp/uncertainty-detection";
import { GuardrailsService } from "@/lib/guardrails/guardrails-service";
import { getKgService } from "@/lib/db/graph/kg-service-factory";
import { getEngagementMode } from "@/lib/session/mode-manager";
import {
  MIN_TURNS_BETWEEN_CHECKINS,
  FELT_COHERENCE_CHECKIN_PROBABILITY,
} from "@/lib/attunement/attunement-config";
import { ChatPayloadSchema } from "@/lib/schemas/api";
import { rateLimit } from "@/lib/redis/rate-limit";
import * as sessionState from "@/lib/session/session-state";
import {
  isAwaitingSomaticResponse,
  generateSomaticAcknowledgment,
} from "@/lib/somatic/somatic-service";

import { performEwefAnalysis } from "@/lib/pce/pce-service";
import { conditionallyLogDetailedAnalysis } from "@/lib/pce/conditional-logging";
import { generateExplanation } from "@/lib/pce/metacognition";

// Fallback StreamData and StreamingTextResponse for MVP
class StreamData {
  private _data: any[] = [];
  private _closed = false;
  append(payload: any) {
    if (this._closed) throw new Error("StreamData is closed");
    this._data.push(payload);
  }
  close() {
    this._closed = true;
  }
  get data() {
    return this._data;
  }
}
class StreamingTextResponse extends Response {
  constructor(
    stream: ReadableStream<Uint8Array>,
    init: ResponseInit = {},
    _data?: StreamData
  ) {
    super(stream, init);
    if (_data) {
      // @ts-ignore
      this.streamData = _data.data;
    }
  }
}

const REDIS_KEY_LAST_ASSISTANT_ID_PREFIX = "last_assistant_interaction_id:";
const SESSION_TTL = 86400; // 24 hours

// Define specific limits for this endpoint (User ID based)
const endpointLimit = 60;
const endpointWindow = 60; // 1 minute

async function shouldTriggerCoherenceCheckin(
  userId: string,
  sessionId: string,
  currentTurn: number
): Promise<boolean> {
  try {
    const redisRead = getRedisClient();
    const mode = await getEngagementMode(userId, sessionId);

    if (mode !== "insight") {
      logger.debug(
        `[shouldTriggerCoherenceCheckin] Not in insight mode for user ${userId}, session ${sessionId}`
      );
      return false;
    }

    const lastCheckinTurnStr = await redisRead.get(
      `session:last_checkin_turn:${sessionId}`
    );
    const lastCheckinTurn = lastCheckinTurnStr
      ? Number.parseInt(lastCheckinTurnStr as string, 10)
      : 0;

    if (currentTurn - lastCheckinTurn < MIN_TURNS_BETWEEN_CHECKINS) {
      logger.debug(
        `[shouldTriggerCoherenceCheckin] Not enough turns since last check-in for user ${userId}, session ${sessionId}`
      );
      return false;
    }

    const randomValue = Math.random();
    const shouldTrigger = randomValue < FELT_COHERENCE_CHECKIN_PROBABILITY;
    logger.debug(
      `[shouldTriggerCoherenceCheckin] Random value: ${randomValue}, threshold: ${FELT_COHERENCE_CHECKIN_PROBABILITY}, shouldTrigger: ${shouldTrigger}`
    );
    return shouldTrigger;
  } catch (error) {
    logger.error(
      `Error checking if we should trigger coherence check-in: ${error}`
    );
    return false;
  }
}

async function shouldTriggerBootstrapping(
  userId: string,
  sessionId: string,
  currentTurn: number
): Promise<boolean> {
  // MVP: Simple logic - trigger on first turn
  if (currentTurn === 1) {
    logger.info(`[shouldTriggerBootstrapping] Triggering on first turn for user ${userId}, session ${sessionId}`);
    return true;
  }
  return false;
}

async function generateBootstrappingPrompt(
  userId: string,
  sessionId: string
): Promise<string> {
  // MVP: Simple prompt
  return "To help me get to know you, could you tell me a bit about yourself or what brings you here today?";
}

function createTextStream(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

export const runtime = "edge";

export async function POST(request: NextRequest) {
  // --- Rate Limiting ---
  const rateLimitResponse = await rateLimit(request, {
    limit: endpointLimit,
    window: endpointWindow,
    keyPrefix: "chat:post",
    ipFallback: { enabled: false }, // Requires User ID
  });
  if (rateLimitResponse instanceof NextResponse) {
    return rateLimitResponse; // Returns 429 response if limited
  }
  // --- End Rate Limiting ---

  try {
    // Auth
    const userId = await auth(request as unknown as NextRequest);
    if (!userId) {
      logger.warn("Unauthorized: No userId from auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate
    let body: any;
    try {
      body = await request.json();
    } catch (err) {
      logger.warn("Invalid JSON in request body");
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    const validationResult = ChatPayloadSchema.safeParse(body);
    if (!validationResult.success) {
      const errorDetails = JSON.stringify(validationResult.error.format());
      logger.warn(
        `Validation failed for chat payload: ${errorDetails}`
      );
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }
    const { message, sessionId } = validationResult.data;

    // Generate interaction ID
    const interactionId = uuidv4();

    // Redis clients
    const redisRead = getRedisClient();
    const redisWrite = getRedisClient();

    // --- Request Start: State Fetch ---
    // Turn count
    let currentTurn = 1;
    try {
      const turnCountStr = await redisRead.get(`session:turn_count:${sessionId}`);
      currentTurn = turnCountStr ? Number.parseInt(turnCountStr as string, 10) : 1;
    } catch (err) {
      logger.warn(
        `Could not retrieve turn count for session ${sessionId}, defaulting to 1`
      );
    }
    // Last assistant interaction ID
    const redisKey = `${REDIS_KEY_LAST_ASSISTANT_ID_PREFIX}${sessionId}`;
    let reviewInteractionId: string | null = null;
    try {
      reviewInteractionId = await redisRead.get<string>(redisKey);
      if (reviewInteractionId) {
        logger.debug(
          `Retrieved last assistant interaction ID ${reviewInteractionId} for session ${sessionId}`
        );
      } else {
        logger.debug(
          `No last assistant interaction ID found in Redis for session ${sessionId}`
        );
      }
    } catch (error) {
      logger.error(
        `Failed to retrieve last assistant ID from Redis for session ${sessionId}: ${error}`
      );
    }
    // --- End State Fetch ---

    // KG and Guardrails
    const kgService = getKgService();
    const guardrailsService = new GuardrailsService(kgService);

    // Log interaction (user input, empty agent response for now)
    try {
      await kgService.logInteraction({
        userID: userId,
        sessionID: sessionId,
        userInput: message,
        agentResponse: "",
        interactionType: "chat",
        responseRationaleSource: undefined, // TODO: Pass actual responseRationaleSource when available
      });
    } catch (err) {
      logger.error(
        `Failed to log interaction to KG for user ${userId}, session ${sessionId}: ${err}`
      );
    }

    // Engagement mode
    let currentMode: string | null = null;
    try {
      currentMode = await getEngagementMode(userId, sessionId);
    } catch (err) {
      logger.error(
        `Failed to get engagement mode for user ${userId}, session ${sessionId}: ${err}`
      );
    }

    // Somatic response
    let awaitingSomaticResponse = false;
    try {
      awaitingSomaticResponse = await isAwaitingSomaticResponse(
        userId,
        sessionId
      );
    } catch (err) {
      logger.error(
        `Error checking somatic response state for user ${userId}, session ${sessionId}: ${err}`
      );
    }
    if (awaitingSomaticResponse) {
      logger.info(
        `Processing somatic response for user ${userId}, session ${sessionId}`
      );
      let acknowledgment = "";
      try {
        acknowledgment = await generateSomaticAcknowledgment(userId, sessionId);
      } catch (err) {
        logger.error(
          `Failed to generate somatic acknowledgment: ${err}, returning fallback`
        );
        acknowledgment = "Thank you for your response.";
      }
      try {
        await kgService.setInteractionResponseType(
          interactionId,
          "Template:somatic_acknowledgment"
        );
        await kgService.setInteractionAgentResponse(
          interactionId,
          acknowledgment
        );
      } catch (err) {
        logger.error(
          `Failed to store somatic acknowledgment in KG: ${err}`
        );
      }
      const textStream = createTextStream(acknowledgment);
      return new StreamingTextResponse(textStream);
    }

    // Distress check-in
    let awaitingDistressResponse = false;
    try {
      awaitingDistressResponse = await sessionState.isAwaitingDistressCheckResponse(
        sessionId
      );
    } catch (err) {
      logger.error(
        `Error checking distress check-in state for session ${sessionId}: ${err}`
      );
    }
    if (awaitingDistressResponse) {
      logger.info(
        `Processing distress check-in response for user ${userId}, session ${sessionId}`
      );
      let acknowledgment = "";
      try {
        await sessionState.setAwaitingDistressCheckResponse(sessionId, false);
        acknowledgment = "Thank you for sharing. Let's continue.";
        logger.info(`Cleared awaiting distress response flag for session ${sessionId}`)
      } catch (err) {
        logger.error(
          `Failed to handle distress check-in response: ${err}, returning fallback`
        );
        acknowledgment = "Thank you for your response.";
      }
      try {
        await kgService.setInteractionResponseType(
          interactionId,
          "Template:distress_acknowledgment"
        );
        await kgService.setInteractionAgentResponse(
          interactionId,
          acknowledgment
        );
      } catch (err) {
        logger.error(
          `Failed to store distress acknowledgment in KG: ${err}`
        );
      }
      const textStream = createTextStream(acknowledgment);
      return new StreamingTextResponse(textStream);
    }

    // Bootstrapping (MVP: on first turn)
    let triggerBootstrap = false;
    try {
      triggerBootstrap = await shouldTriggerBootstrapping(
        userId,
        sessionId,
        currentTurn
      );
    } catch (err) {
      logger.error(
        `Error checking bootstrapping trigger for user ${userId}, session ${sessionId}: ${err}`
      );
    }
    if (triggerBootstrap) {
      let bootstrapPrompt = "";
      try {
        bootstrapPrompt = await generateBootstrappingPrompt(userId, sessionId);
      } catch (err) {
        logger.error(
          `Failed to generate bootstrapping prompt: ${err}, returning fallback`
        );
        bootstrapPrompt = "I'd like to learn more about you to provide better assistance.";
      }
      try {
        await kgService.setInteractionResponseType(
          interactionId,
          "Template:bootstrap_prompt"
        );
        await kgService.setInteractionAgentResponse(
          interactionId,
          bootstrapPrompt
        );
      } catch (err) {
        logger.error(
          `Failed to store bootstrap prompt in KG: ${err}`
        );
      }
      const textStream = createTextStream(bootstrapPrompt);
      return new StreamingTextResponse(textStream);
    }

    // Coherence check-in
    let shouldTriggerCheckin = false;
    try {
      shouldTriggerCheckin = await shouldTriggerCoherenceCheckin(
        userId,
        sessionId,
        currentTurn
      );
    } catch (err) {
      logger.error(
        `Error checking coherence check-in trigger for user ${userId}, session ${sessionId}: ${err}`
      );
    }
    if (shouldTriggerCheckin && reviewInteractionId) {
      logger.info(
        `Triggering coherence check-in for user ${userId}, session ${sessionId}, reviewing interaction ${reviewInteractionId}`
      );
      const coherenceCheckInPrompt =
        "How well did my previous response address your needs? Please rate it.";
      try {
        await kgService.setInteractionResponseType(
          interactionId,
          "Template:coherence_checkin"
        );
        await kgService.setInteractionAgentResponse(
          interactionId,
          coherenceCheckInPrompt
        );
      } catch (err) {
        logger.error(
          `Failed to store coherence check-in prompt in KG: ${err}`
        );
      }
      const data = new StreamData();
      const dataPayload = { isCheckIn: true, reviewInteractionId };
      data.append(dataPayload);
      data.close();
      const textStream = createTextStream(coherenceCheckInPrompt);
      // --- Atomic Redis update for check-in state ---
      try {
        const pipeline = redisWrite.pipeline();
        pipeline.set(
          `session:last_checkin_turn:${sessionId}`,
          currentTurn.toString()
        );
        pipeline.expire(
          `session:last_checkin_turn:${sessionId}`,
          SESSION_TTL
        );
        await pipeline.exec();
      } catch (err) {
        logger.error(
          `Failed to update last_checkin_turn in Redis (pipeline): ${err}`
        );
      }
      return new StreamingTextResponse(textStream, {}, data);
    }

    // Increment turn count for next interaction
    try {
      await redisWrite.incr(`session:turn_count:${sessionId}`);
      await redisWrite.expire(`session:turn_count:${sessionId}`, SESSION_TTL);
    } catch (err) {
      logger.error(
        `Failed to increment/expire turn count in Redis for session ${sessionId}: ${err}`
      );
    }

    // PCE processing
    let pceResult: any = null;
    try {
      pceResult = await performEwefAnalysis(userId, sessionId, message);
    } catch (err) {
      logger.error(
        `Error in performEwefAnalysis for user ${userId}, session ${sessionId}: ${err}`
      );
      return NextResponse.json(
        { error: "PCE analysis failed" },
        { status: 500 }
      );
    }

    // --- Conditional Logging of EWEF Analysis ---
    try {
      await conditionallyLogDetailedAnalysis({
        userId: userId,
        sessionId: sessionId,
        interactionId: interactionId,
        currentMode: currentMode || 'insight',
        kgService,
        stateData: {
          moodEstimate: pceResult?.state?.moodEstimate ?? 0,
          stressEstimate: pceResult?.state?.stressEstimate ?? 0,
        },
        perceptionData: {
          mhhSource: pceResult?.pInstance?.mhhSource ?? "external",
          mhhPerspective: pceResult?.pInstance?.mhhPerspective ?? "self",
          mhhTimeframe: pceResult?.pInstance?.mhhTimeframe ?? "present",
          mhhAcceptanceState: pceResult?.pInstance?.mhhAcceptanceState ?? "uncertain",
          pValuationShiftEstimate: pceResult?.pInstance?.pValuationShiftEstimate ?? 0,
          pPowerLevel: pceResult?.pInstance?.pPowerLevel ?? 0.5,
          pAppraisalConfidence: pceResult?.pInstance?.pAppraisalConfidence ?? 0.5,
        },
        reactionData: {
          valence: pceResult?.vad?.valence ?? 0,
          arousal: pceResult?.vad?.arousal ?? 0,
          dominance: pceResult?.vad?.dominance ?? 0,
          confidence: pceResult?.vad?.confidence ?? 0.5,
        },
      });
    } catch (err) {
      logger.error(
        `Failed to conditionally log detailed EWEF analysis for user ${userId}, session ${sessionId}: ${err}`
      );
    }

    // Uncertainty detection
    let uncertaintyResult: any = null;
    try {
      const nlpFeatures = pceResult?.nlpFeatures;
      if (nlpFeatures) {
        uncertaintyResult = await detectUncertainty(message, nlpFeatures);
      } else {
        logger.warn(`Skipping uncertainty detection: No NLP features found in PCE result for session ${sessionId}`);
      }
    } catch (err) {
      logger.error(
        `Error in detectUncertainty for user ${userId}, session ${sessionId}: ${err}`
      );
    }

    // EWEF analysis
    const ewefAnalysis = pceResult?.ewefAnalysis || {};

    // Guardrails
    let finalResponse: string = "I'm sorry, I encountered an issue processing your request.";
    const candidateResponse = pceResult?.response || "";

    if (candidateResponse) {
      try {
        const moodEstimate = ewefAnalysis.vad?.valence !== undefined
          ? (ewefAnalysis.vad.valence + 1) / 2
          : 0.5;
        const stressEstimate = ewefAnalysis.vad?.arousal !== undefined
          ? ewefAnalysis.vad.arousal
          : 0.5;

        const guardrailContext = {
          userID: userId,
          sessionID: sessionId,
          interactionID: interactionId,
          moodEstimate,
          stressEstimate,
        };

        const guardrailResult = await guardrailsService.applyGuardrails(
          candidateResponse,
          guardrailContext
        );

        finalResponse = guardrailResult.finalResponseText;

        if (!guardrailResult.passed && guardrailResult.alertData) {
          const alertDetails = JSON.stringify({ alert: guardrailResult.alertData, userId, sessionId });
          logger.warn(`Guardrail triggered: ${alertDetails}`);
        }
      } catch (err) {
        logger.error(
          `Error in applyGuardrails for user ${userId}, session ${sessionId}: ${err}`
        );
      }
    } else {
      logger.error(`No candidate response from PCE for user ${userId}, session ${sessionId}`);
    }

    // --- Standard Response: Final State Update (KG + Redis) ---
    // (after generating finalResponse)
    // Store response in KG and update Redis state atomically
    try {
      await kgService.setInteractionResponseType(interactionId, "Response");
      await kgService.setInteractionAgentResponse(interactionId, finalResponse);
      // Redis pipeline for turn count and last assistant ID
      const pipeline = redisWrite.pipeline();
      pipeline.incr(`session:turn_count:${sessionId}`);
      pipeline.expire(`session:turn_count:${sessionId}`, SESSION_TTL);
      pipeline.set(redisKey, interactionId);
      pipeline.expire(redisKey, SESSION_TTL);
      await pipeline.exec();
    } catch (err) {
      logger.error(
        `Failed to update KG or Redis state atomically for user ${userId}, session ${sessionId}: ${err}`
      );
    }

    // --- XAI Explanation Streaming ---
    let xaiText = "";
    try {
      xaiText = await generateExplanation(pceResult);
    } catch (err) {
      logger.error(`Failed to generate XAI explanation: ${err}`);
    }
    const data = new StreamData();
    data.append({
      type: 'xai-explanation',
      interactionId: interactionId,
      explanation: xaiText
    });
    data.close();

    // Stream response
    const textStream = createTextStream(finalResponse);
    return new StreamingTextResponse(textStream, {}, data);
  } catch (error) {
    logger.error(`Error in chat API: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}