import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth-utils";
import { logger } from "@/lib/utils/logger";
import { processPceMvpRequest } from "@/lib/pce/pce-service";
import { redisPrimary, redisReplica } from "@/lib/redis/client";
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
import {
  shouldTriggerDistressCheckin,
  generateDistressCheckin,
} from "@/lib/distress/distress-detection";

// NOTE: The following imports are commented out because of lint errors in the context
// import { StreamingTextResponse, StreamData } from "ai" // Update import to include StreamData

// Instead, we define a fallback StreamingTextResponse and StreamData for debugging
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
    // Optionally attach metadata for debugging
    super(stream, init);
    if (_data) {
      // @ts-ignore
      this.streamData = _data.data;
    }
  }
}

// Redis key prefix for last assistant interaction ID
const REDIS_KEY_LAST_ASSISTANT_ID_PREFIX = "last_assistant_interaction_id:";

// Session TTL in seconds (24 hours)
const SESSION_TTL = 86400;

/**
 * Check if we should trigger a coherence check-in
 */
async function shouldTriggerCoherenceCheckin(
  userId: string,
  sessionId: string,
  currentTurn: number
): Promise<boolean> {
  try {
    const redisRead = redisReplica;
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

/**
 * Check if we should trigger bootstrapping
 * TODO: Implement real logic for bootstrapping trigger.
 */
async function shouldTriggerBootstrapping(
  userId: string,
  sessionId: string,
  currentTurn: number
): Promise<boolean> {
  // Placeholder: always false for now
  logger.debug(
    `[shouldTriggerBootstrapping] Not implemented, always returns false`
  );
  return false;
}

/**
 * Generate bootstrapping prompt
 * TODO: Implement real bootstrapping prompt logic.
 */
async function generateBootstrappingPrompt(
  userId: string,
  sessionId: string
): Promise<string> {
  logger.debug(
    `[generateBootstrappingPrompt] Not implemented, returning default message`
  );
  return "I'd like to learn more about you to provide better assistance.";
}

/**
 * Create a simple text stream from a string
 */
function createTextStream(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
}

export async function POST(request: NextRequest) {
  // Enhanced rate limiting with IP fallback and token bucket algorithm
  let rateLimitResult: any;
  try {
    rateLimitResult = await rateLimit(request, {
      limit: Number(process.env.PULSE_CHAT_RATE_LIMIT_MAX || 60),
      window: Number(process.env.PULSE_CHAT_RATE_WINDOW_S || 60),
      ipFallback: {
        limit: Number(process.env.PULSE_CHAT_IP_RATE_LIMIT_MAX || 30),
        window: Number(process.env.PULSE_CHAT_IP_RATE_WINDOW_S || 60),
      },
      // @ts-ignore - allow string for debugging, but should be type-safe in prod
      algorithm: "token-bucket",
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
    // Authenticate the request
    const userId = await auth(request as unknown as NextRequest);
    if (!userId) {
      logger.warn("Unauthorized: No userId from auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate the request body
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
      // Combine message and details into one string for logger.warn
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

    // Generate a unique interaction ID for this request
    const interactionId = uuidv4();

    // Get Redis client instances
    const redisRead = redisReplica;
    const redisWrite = redisPrimary;

    // Retrieve the last assistant interaction ID from Redis
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

    // Get the current turn count
    let currentTurn = 1;
    try {
      const turnCountStr = await redisRead.get(`session:turn_count:${sessionId}`);
      currentTurn = turnCountStr ? Number.parseInt(turnCountStr as string, 10) : 1;
    } catch (err) {
      logger.warn(
        `Could not retrieve turn count for session ${sessionId}, defaulting to 1`
      );
    }

    // Get KgService instance
    const kgService = getKgService();

    // Instantiate GuardrailsService
    const guardrailsService = new GuardrailsService(kgService);

    // Log the basic interaction (always done regardless of consent or mode)
    try {
      await kgService.logInteraction({
        userID: userId,
        sessionID: sessionId,
        userInput: message,
        agentResponse: "", // Will be filled in later
        interactionType: "chat",
      });
    } catch (err) {
      logger.error(
        `Failed to log interaction to KG for user ${userId}, session ${sessionId}: ${err}`
      );
    }

    // Get the current engagement mode
    let currentMode: string | null = null;
    try {
      currentMode = await getEngagementMode(userId, sessionId);
    } catch (err) {
      logger.error(
        `Failed to get engagement mode for user ${userId}, session ${sessionId}: ${err}`
      );
    }

    // Check if we're awaiting a response to a special prompt
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

    // Check if we're awaiting a response to a distress check-in
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
        // Since the handler doesn't exist, clear the flag and provide a generic response
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

    // Check if we should trigger bootstrapping
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

    // Check if we should trigger a coherence check-in
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
      // Create a StreamData instance for the metadata
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

    // Perform regular PCE processing
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
          currentTurn,
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

    // STEP 7: Emotion Categorization (Integration Point)
    let uncertaintyResult: any = null;
    try {
      // Use pceResult.nlpFeatures (assuming structure) AND the original message text
      const nlpFeatures = pceResult?.nlpFeatures; // Adjust if the property name is different
      if (nlpFeatures) {
        uncertaintyResult = await detectUncertainty(message, nlpFeatures); // Pass both message and features
      } else {
        logger.warn(`Skipping uncertainty detection: No NLP features found in PCE result for session ${sessionId}`);
      }
    } catch (err) {
      logger.error(
        `Error in detectUncertainty for user ${userId}, session ${sessionId}: ${err}`
      );
    }

    // Get the EWEF analysis from the PCE result
    const ewefAnalysis = pceResult?.ewefAnalysis || {};

    // Apply Guardrails
    let finalResponse: string = "I'm sorry, I encountered an issue processing your request."; // Default fallback
    const candidateResponse = pceResult?.response || ""; // Get candidate response from PCE

    if (candidateResponse) {
      try {
        // Placeholder mapping for mood/stress - refine this based on actual data structure
        const moodEstimate = ewefAnalysis.vad?.valence ? (ewefAnalysis.vad.valence + 1) / 2 : 0.5; // Normalize valence to 0-1
        const stressEstimate = ewefAnalysis.vad?.arousal || 0.5; // Use arousal directly (0-1)

        const guardrailContext = {
          userID: userId,
          sessionID: sessionId,
          interactionID: interactionId,
          moodEstimate: moodEstimate,
          stressEstimate: stressEstimate,
        };

        // Call the instance method
        const guardrailResult = await guardrailsService.applyGuardrails(
          candidateResponse,
          guardrailContext
        );

        finalResponse = guardrailResult.finalResponseText;

        if (!guardrailResult.passed && guardrailResult.alertData) {
           // Combine message and details into one string for logger.warn
           const alertDetails = JSON.stringify({ alert: guardrailResult.alertData, userId, sessionId });
           logger.warn(`Guardrail triggered: ${alertDetails}`);
           // Optionally log the alert to KG or another monitoring system
        }

      } catch (err) {
        logger.error(
          `Error in applyGuardrails for user ${userId}, session ${sessionId}: ${err}`
        );
        // Keep the default fallback response (already set)
      }
    } else {
       logger.error(`No candidate response from PCE for user ${userId}, session ${sessionId}`);
       // Keep the default fallback response (already set)
    }

    // Store response type and agent response in Neo4j
    try {
      await kgService.setInteractionResponseType(interactionId, "Response");
      await kgService.setInteractionAgentResponse(interactionId, finalResponse);
    } catch (err) {
      logger.error(
        `Failed to store response in KG for user ${userId}, session ${sessionId}: ${err}`
      );
    }

    // Store the current interaction ID as the last assistant interaction ID in Redis
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

    // Create a text stream for the final response
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
