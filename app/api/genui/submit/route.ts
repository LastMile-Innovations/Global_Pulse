import type { NextRequest } from "next/server"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"
import { kgService } from "@/lib/db/graph/kg-service"
import { GenUISubmitPayloadSchema } from "@/lib/schemas/api"

export async function POST(req: NextRequest) {
  try {
    // Authenticate the request
    const { userId } = await auth()
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Parse and validate the request body
    const body = await req.json()
    const validationResult = GenUISubmitPayloadSchema.safeParse(body)
    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Validation failed", details: validationResult.error.format() }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { componentType, data, sessionId, context } = validationResult.data

    // Log the submission
    logger.info(`Processing UI component submission: ${componentType}`, {
      userId,
      componentType,
      dataKeys: Object.keys(data),
      sessionId,
    })

    // Process the submission based on component type
    let result
    switch (componentType) {
      case "slider":
        result = await processSliderSubmission(userId, data, context)
        break
      case "multipleChoice":
        result = await processMultipleChoiceSubmission(userId, data, context)
        break
      case "confirmation":
        result = await processConfirmationSubmission(userId, data, context)
        break
      case "formInput":
        result = await processFormInputSubmission(userId, data, context)
        break
      default:
        throw new Error(`Unsupported component type: ${componentType}`)
    }

    // Return the result
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    logger.error("Error in genui submit API:", error)
    return new Response(JSON.stringify({ error: "Failed to process UI component submission" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

/**
 * Process slider submission
 */
async function processSliderSubmission(
  userId: string,
  data: Record<string, any>,
  context?: Record<string, any>,
): Promise<any> {
  // Extract the value from the slider submission
  const { value, label } = data

  // If context includes an attachment name, update the attachment rating
  if (context?.attachmentName) {
    await kgService.updateAttachmentRating(userId, context.attachmentName, value)
    return { updated: true, attachmentName: context.attachmentName, newValue: value }
  }

  // Generic processing for other slider submissions
  logger.info(`Slider value submitted: ${value} for "${label}"`, { userId })
  return { processed: true, value }
}

/**
 * Process multiple choice submission
 */
async function processMultipleChoiceSubmission(
  userId: string,
  data: Record<string, any>,
  context?: Record<string, any>,
): Promise<any> {
  // Extract the selected options
  const { selectedOptions, question } = data

  logger.info(`Multiple choice selection: ${JSON.stringify(selectedOptions)} for "${question}"`, { userId })

  // Process based on context
  if (context?.updatePreferences) {
    // Example: Update user preferences in the knowledge graph
    // await kgService.updateUserPreferences(userId, selectedOptions)
    return { updated: true, preferences: selectedOptions }
  }

  return { processed: true, selectedOptions }
}

/**
 * Process confirmation submission
 */
async function processConfirmationSubmission(
  userId: string,
  data: Record<string, any>,
  context?: Record<string, any>,
): Promise<any> {
  // Extract the confirmation result
  const { confirmed, message } = data

  logger.info(`Confirmation response: ${confirmed} for "${message}"`, { userId })

  // Process based on context
  if (context?.action && confirmed) {
    // Example: Perform the confirmed action
    // await performAction(userId, context.action)
    return { actionPerformed: true, action: context.action }
  }

  return { processed: true, confirmed }
}

/**
 * Process form input submission
 */
async function processFormInputSubmission(
  userId: string,
  data: Record<string, any>,
  context?: Record<string, any>,
): Promise<any> {
  // Extract the input value
  const { value, label } = data

  logger.info(`Form input submitted: "${value}" for field "${label}"`, { userId })

  // Process based on context
  if (context?.updateProfile) {
    // Example: Update user profile information
    // await updateUserProfile(userId, label, value)
    return { profileUpdated: true, field: label }
  }

  return { processed: true, value }
}
