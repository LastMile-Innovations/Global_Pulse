import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth-utils"
import { logger } from "@/lib/utils/logger"
import { processPceMvpRequest } from "@/lib/pce/pce-service"
import { getRedisClient } from "@/lib/redis/client"
import { StreamingTextResponse, StreamData } from "ai" // Update import to include StreamData
import { v4 as uuidv4 } from "uuid"
import { detectUncertainty } from "@/lib/nlp/uncertainty-detection"
import { applyGuardrails } from "@/lib/guardrails/guardrails-service"
import { getKgService } from "@/lib/db/graph/kg-service-factory"
import { getEngagementMode } from "@/lib/session/mode-manager"
import { MIN_TURNS_BETWEEN_CHECKINS, FELT_COHERENCE_CHECKIN_PROBABILITY } from "@/lib/attunement/attunement-config"
import { ChatPayloadSchema } from "@/lib/schemas/api"
import { rateLimit } from "@/lib/redis/rate-limit"

// Import the special flow functions
import { isAwaitingSomaticResponse, generateSomaticAcknowledgment } from "@/lib/somatic/somatic-service"

import { isAwaitingDistressCheckResponse, handleDistressCheckinResponse } from "@/lib/distress/distress-detection"

// Redis key prefix for last assistant interaction ID
const REDIS_KEY_LAST_ASSISTANT_ID_PREFIX = "last_assistant_interaction_id:"

// Session TTL in seconds (24 hours)
const SESSION_TTL = 86400

/**
 * Check if we should trigger a coherence check-in
 */
async function shouldTriggerCoherenceCheckin(userId: string, sessionId: string, currentTurn: number): Promise<boolean> {
  try {
    // Get Redis client
    const redis = getRedisClient()

    // Get the current engagement mode
    const mode = await getEngagementMode(userId, sessionId)

    // Only trigger in insight mode
    if (mode !== "insight") {
      return false
    }

    // Get the last check-in turn
    const lastCheckinTurnStr = await redis.get(`session:last_checkin_turn:${sessionId}`)
    const lastCheckinTurn = lastCheckinTurnStr ? Number.parseInt(lastCheckinTurnStr, 10) : 0

    // Check if we've had enough turns since the last check-in
    if (currentTurn - lastCheckinTurn < MIN_TURNS_BETWEEN_CHECKINS) {
      return false
    }

    // Random chance based on probability
    return Math.random() < FELT_COHERENCE_CHECKIN_PROBABILITY
  } catch (error) {
    logger.error(`Error checking if we should trigger coherence check-in: ${error}`)
    return false
  }
}

// Add this function after the shouldTriggerCoherenceCheckin function
/**
 * Check if we should trigger bootstrapping
 */
async function shouldTriggerBootstrapping(userId: string, sessionId: string, currentTurn: number): Promise<boolean> {
  // This is a placeholder function that should be implemented elsewhere
  // For now, return false to avoid errors
  return false
}

/**
 * Generate bootstrapping prompt
 */
async function generateBootstrappingPrompt(userId: string, sessionId: string): Promise<string> {
  // This is a placeholder function that should be implemented elsewhere
  // For now, return a simple message
  return "I'd like to learn more about you to provide better assistance."
}

/**
 * Create a simple text stream from a string
 */
function createTextStream(text: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text))
      controller.close()
    },
  })
}

export async function POST(request: NextRequest) {
  // Apply enhanced rate limiting with IP fallback and token bucket algorithm
  const rateLimitResult = await rateLimit(request, {
    limit: Number(process.env.PULSE_CHAT_RATE_LIMIT_MAX || 60),
    window: Number(process.env.PULSE_CHAT_RATE_WINDOW_S || 60),
    ipFallback: {
      // More restrictive limits for unauthenticated requests
      limit: Number(process.env.PULSE_CHAT_IP_RATE_LIMIT_MAX || 30),
      window: Number(process.env.PULSE_CHAT_IP_RATE_WINDOW_S || 60),
    },
    algorithm: "token-bucket",
    tokenBucket: {
      // Allow bursts of up to 10 requests
      bucketSize: Number(process.env.PULSE_CHAT_BUCKET_SIZE || 10),
      // Refill at a rate of limit/window tokens per second
      refillRate: Number(process.env.PULSE_CHAT_REFILL_RATE || 1),
    },
  })

  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult
  }

  try {
    // Authenticate the request
    const userId = await auth(request as unknown as NextRequest)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()

    // Validate input using centralized schema
    const validationResult = ChatPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 },
      )
    }

    const { message, sessionId } = validationResult.data

    // Generate a unique interaction ID for this request
    const interactionId = uuidv4()

    // Get Redis client
    const redis = getRedisClient()

    // Retrieve the last assistant interaction ID from Redis
    const redisKey = `${REDIS_KEY_LAST_ASSISTANT_ID_PREFIX}${sessionId}`
    let reviewInteractionId: string | null = null
    try {
      reviewInteractionId = await redis.get<string>(redisKey)
      if (reviewInteractionId) {
        logger.debug(`Retrieved last assistant interaction ID ${reviewInteractionId} for session ${sessionId}`)
      } else {
        logger.debug(`No last assistant interaction ID found in Redis for session ${sessionId}`)
      }
    } catch (error) {
      logger.error(`Failed to retrieve last assistant ID from Redis for session ${sessionId}: ${error}`)
      // reviewInteractionId remains null
    }

    // Get the current turn count
    const turnCountStr = await redis.get(`session:turn_count:${sessionId}`)
    const currentTurn = turnCountStr ? Number.parseInt(turnCountStr, 10) : 1

    // Get KgService instance
    const kgService = getKgService()

    // Log the basic interaction (always done regardless of consent or mode)
    await kgService.logInteraction({
      userID: userId,
      sessionID: sessionId,
      userInput: message,
      agentResponse: "", // Will be filled in later
      interactionType: "chat",
    })

    // Get the current engagement mode
    const currentMode = await getEngagementMode(userId, sessionId)

    // Check if we're awaiting a response to a special prompt
    const awaitingSomaticResponse = await isAwaitingSomaticResponse(userId, sessionId)
    if (awaitingSomaticResponse) {
      logger.info(`Processing somatic response for user ${userId}, session ${sessionId}`)

      // Generate acknowledgment for the somatic response
      const acknowledgment = await generateSomaticAcknowledgment(userId, sessionId)

      // Store response type and agent response in Neo4j
      await kgService.setInteractionResponseType(interactionId, "Template:somatic_acknowledgment")
      await kgService.setInteractionAgentResponse(interactionId, acknowledgment)

      // Return the acknowledgment as a stream
      const textStream = createTextStream(acknowledgment)
      return new StreamingTextResponse(textStream)
    }

    // Check if we're awaiting a response to a distress check-in
    const awaitingDistressResponse = await isAwaitingDistressCheckResponse(sessionId)
    if (awaitingDistressResponse) {
      logger.info(`Processing distress check-in response for user ${userId}, session ${sessionId}`)

      // Handle the distress check-in response
      const acknowledgment = await handleDistressCheckinResponse(userId, sessionId, message)

      // Store response type and agent response in Neo4j
      await kgService.setInteractionResponseType(interactionId, "Template:distress_acknowledgment")
      await kgService.setInteractionAgentResponse(interactionId, acknowledgment)

      // Return the acknowledgment as a stream
      const textStream = createTextStream(acknowledgment)
      return new StreamingTextResponse(textStream)
    }

    // Check if we should trigger bootstrapping
    const triggerBootstrap = await shouldTriggerBootstrapping(userId, sessionId, currentTurn)
    if (triggerBootstrap) {
      const bootstrapPrompt = await generateBootstrappingPrompt(userId, sessionId)

      // Store response type and agent response in Neo4j
      await kgService.setInteractionResponseType(interactionId, "Template:bootstrap_prompt")
      await kgService.setInteractionAgentResponse(interactionId, bootstrapPrompt)

      // Return this prompt as the agent response, skipping normal EWEF pipeline for this turn
      const textStream = createTextStream(bootstrapPrompt)
      return new StreamingTextResponse(textStream)
    }

    // Check if we should trigger a coherence check-in
    // Modified to include reviewInteractionId check
    const shouldTriggerCheckin = await shouldTriggerCoherenceCheckin(userId, sessionId, currentTurn)
    if (shouldTriggerCheckin && reviewInteractionId) {
      logger.info(
        `Triggering coherence check-in for user ${userId}, session ${sessionId}, reviewing interaction ${reviewInteractionId}`,
      )

      // Generate coherence check-in prompt (this function should be implemented elsewhere)
      const coherenceCheckInPrompt = "How well did my previous response address your needs? Please rate it."

      // Store response type and agent response in Neo4j
      await kgService.setInteractionResponseType(interactionId, "Template:coherence_checkin")
      await kgService.setInteractionAgentResponse(interactionId, coherenceCheckInPrompt)

      // Create a StreamData instance for the metadata
      const data = new StreamData()

      // Create the metadata payload
      const dataPayload = { isCheckIn: true, reviewInteractionId }

      // Append the payload to the stream data
      data.append(dataPayload)

      // Close the data stream
      data.close()

      // Create a text stream for the check-in prompt
      const textStream = createTextStream(coherenceCheckInPrompt)

      // Update the last check-in turn in Redis
      await redis.set(`session:last_checkin_turn:${sessionId}`, currentTurn.toString(), { ex: SESSION_TTL })

      // Return the check-in prompt as a stream with metadata
      return new StreamingTextResponse(textStream, {}, data)
    }

    // Increment turn count for next interaction
    await redis.incr(`session:turn_count:${sessionId}`)
    await redis.expire(`session:turn_count:${sessionId}`, SESSION_TTL)

    // Perform regular PCE processing
    const pceResult = await processPceMvpRequest(
      {
        userID: userId,
        sessionID: sessionId,
        utteranceText: message,
      },
      {
        useLlmAssistance: true,
        currentTurn,
      },
    )

    // -------------------------------------------------------------------------
    // STEP 7: Emotion Categorization (Integration Point)
    // -------------------------------------------------------------------------

    // Detect uncertainty in the user message
    const uncertaintyResult = await detectUncertainty(message)

    // Get the EWEF analysis from the PCE result
    const ewefAnalysis = pceResult.ewefAnalysis

    // Store EWEF Analysis
    const finalResponse = await applyGuardrails("Response", {
      userId,
      sessionId,
      userMessage: message,
      vad: ewefAnalysis.vad,
    })

    // Store response type and agent response in Neo4j
    await kgService.setInteractionResponseType(interactionId, "Response")
    await kgService.setInteractionAgentResponse(interactionId, finalResponse)

    // Store the current interaction ID as the last assistant interaction ID in Redis
    // Only do this for substantive responses (not check-ins, somatic, or distress responses)
    try {
      await redis.set(redisKey, interactionId, { ex: SESSION_TTL })
      logger.debug(`Stored last assistant interaction ID ${interactionId} for session ${sessionId}`)
    } catch (error) {
      logger.error(`Failed to store last assistant ID in Redis for session ${sessionId}: ${error}`)
    }

    // Create a text stream for the final response
    const textStream = createTextStream(finalResponse)
    return new StreamingTextResponse(textStream)
  } catch (error) {
    logger.error(`Error in chat API: ${error}`)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
