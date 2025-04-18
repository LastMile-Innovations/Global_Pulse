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
import { RateLimitAlgorithm } from "@/lib/redis/rate-limit";

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

export async function POST(request: NextRequest) {
  // Rate limiting
  let rateLimitResult: any;
  try {
    rateLimitResult = await rateLimit(request, {
      limit: Number(process.env.PULSE_CHAT_RATE_LIMIT_MAX || 60),
      window: Number(process.env.PULSE_CHAT_RATE_WINDOW_S || 60),
      ipFallback: {
        limit: Number(process.env.PULSE_CHAT_IP_RATE_LIMIT_MAX || 30),
        window: Number(process.env.PULSE_CHAT_IP_RATE_WINDOW_S || 60),
      },
      algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
      tokenBucket: {
        bucketSize: Number(process.env.PULSE_CHAT_BUCKET_SIZE || 10),
        refillRate: Number(process.env.PULSE_CHAT_REFILL_RATE || 1),
      },
    });
  } catch (err) {
    logger.error(`Rate limit error: ${err}`);
    return NextResponse.json(
      { error: "Rate limit configuration error" },
      { status: 500 }
    );
  }
  if (rateLimitResult instanceof NextResponse) {
    logger.warn("Rate limit exceeded or error, returning early");
    return rateLimitResult;
  }

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

      try {
        await redisWrite.set(
          `session:last_checkin_turn:${sessionId}`,
          currentTurn.toString(),
          { ex: SESSION_TTL }
        );
      } catch (err) {
        logger.error(
          `Failed to update last check-in turn in Redis: ${err}`
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
    let pceResult: any;
    try {
      pceResult = await processPceMvpRequest(
        {
          userID: userId,
          sessionID: sessionId,
          utteranceText: message,
        },
        {
          useLlmAssistance: true,
        }
      );
    } catch (err) {
      logger.error(
        `Error in processPceMvpRequest for user ${userId}, session ${sessionId}: ${err}`
      );
      return NextResponse.json(
        { error: "Failed to process request" },
        { status: 500 }
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

    // Store response in KG
    try {
      await kgService.setInteractionResponseType(interactionId, "Response");
      await kgService.setInteractionAgentResponse(interactionId, finalResponse);
    } catch (err) {
      logger.error(
        `Failed to store response in KG for user ${userId}, session ${sessionId}: ${err}`
      );
    }

    // Store last assistant interaction ID
    try {
      await redisWrite.set(redisKey, interactionId, { ex: SESSION_TTL });
      logger.debug(
        `Stored last assistant interaction ID ${interactionId} for session ${sessionId}`
      );
    } catch (error) {
      logger.error(
        `Failed to store last assistant ID in Redis for session ${sessionId}: ${error}`
      );
    }

    // Stream response
    const textStream = createTextStream(finalResponse);
    return new StreamingTextResponse(textStream);
  } catch (error) {
    logger.error(`Error in chat API: ${error}`);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
