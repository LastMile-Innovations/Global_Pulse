import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/utils/logger"
import { auth } from "@/lib/auth/auth-utils"
import { getKgService } from "@/lib/db/graph/kg-service-factory"
import { GenUISubmitPayloadSchema } from "@/lib/schemas/api"

/**
 * POST /api/genui/submit
 * Handles generic UI component submissions (slider, multipleChoice, confirmation, formInput)
 */
export async function POST(req: NextRequest) {
  // Authenticate the request
  const userId = await auth(req)
  if (!userId) {
    logger.warn("Unauthorized UI component submission attempt")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Parse and validate the request body
  let body: any
  try {
    body = await req.json()
  } catch (err) {
    logger.warn("Invalid JSON in UI component submission")
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const validationResult = GenUISubmitPayloadSchema.safeParse(body)
  if (!validationResult.success) {
    logger.warn("Validation failed for UI component submission")
    return NextResponse.json(
      { error: "Validation failed", details: validationResult.error.format() },
      { status: 400 },
    )
  }

  const { componentType, data, sessionId, context } = validationResult.data

  // Log the submission
  logger.info(
    `Processing UI component submission: ${componentType} (session: ${sessionId}) user: ${userId} keys: ${Object.keys(data).join(", ")}`,
  )

  // Get the KG service (if needed)
  const kgService = getKgService()

  // Process the submission based on component type
  let result: any
  try {
    switch (componentType) {
      case "slider":
        result = await processSliderSubmission(userId, data, context, kgService)
        break
      case "multipleChoice":
        result = await processMultipleChoiceSubmission(userId, data, context, kgService)
        break
      case "confirmation":
        result = await processConfirmationSubmission(userId, data, context, kgService)
        break
      case "formInput":
        result = await processFormInputSubmission(userId, data, context, kgService)
        break
      default:
        logger.warn(`Unsupported component type: ${componentType}`)
        return NextResponse.json(
          { error: `Unsupported component type: ${componentType}` },
          { status: 400 },
        )
    }
  } catch (err) {
    logger.error("Error processing UI component submission")
    return NextResponse.json(
      { error: "Failed to process UI component submission", details: String(err) },
      { status: 500 },
    )
  }

  // Return the result
  return NextResponse.json({ success: true, result }, { status: 200 })
}

/**
 * Process slider submission
 */
async function processSliderSubmission(
  userId: string,
  data: Record<string, any>,
  context?: Record<string, any>,
  kgService?: any,
): Promise<any> {
  const { value, label } = data

  // If context includes an attachment name, update the attachment rating
  if (context?.attachmentName && kgService?.updateAttachmentRating) {
    await kgService.updateAttachmentRating(userId, context.attachmentName, value)
    logger.info(
      `Attachment rating updated: ${context.attachmentName} = ${value} by user ${userId}`,
    )
    return { updated: true, attachmentName: context.attachmentName, newValue: value }
  }

  // If context includes a sessionId and a sliderType, store the slider value in the KG
  if (context?.sessionId && context?.sliderType && kgService?.recordSliderValue) {
    await kgService.recordSliderValue(userId, context.sessionId, context.sliderType, value)
    logger.info(
      `Slider value recorded: ${context.sliderType} = ${value} for session ${context.sessionId} by user ${userId}`,
    )
    return { recorded: true, sliderType: context.sliderType, value }
  }

  // Generic processing for other slider submissions
  logger.info(`Slider value submitted: ${value} for "${label}" by user ${userId}`)
  return { processed: true, value }
}

/**
 * Process multiple choice submission
 */
async function processMultipleChoiceSubmission(
  userId: string,
  data: Record<string, any>,
  context?: Record<string, any>,
  kgService?: any,
): Promise<any> {
  const { selectedOptions, question } = data

  logger.info(
    `Multiple choice selection: ${JSON.stringify(selectedOptions)} for "${question}" by user ${userId}`,
  )

  // If context requests updating user preferences, do so
  if (context?.updatePreferences && kgService?.updateUserPreferences) {
    await kgService.updateUserPreferences(userId, selectedOptions)
    logger.info(
      `User preferences updated for user ${userId}: ${JSON.stringify(selectedOptions)}`,
    )
    return { updated: true, preferences: selectedOptions }
  }

  // If context requests storing the answer in the KG
  if (context?.storeAnswer && kgService?.recordMultipleChoiceAnswer) {
    await kgService.recordMultipleChoiceAnswer(userId, question, selectedOptions)
    logger.info(
      `Multiple choice answer recorded for user ${userId}: ${JSON.stringify(selectedOptions)}`,
    )
    return { recorded: true, question, selectedOptions }
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
  kgService?: any,
): Promise<any> {
  const { confirmed, message } = data

  logger.info(
    `Confirmation response: ${confirmed} for "${message}" by user ${userId}`,
  )

  // If context includes an action and the user confirmed, perform the action
  if (context?.action && confirmed) {
    // Example: If the action is "deleteAccount", call a hypothetical deleteAccount function
    if (context.action === "deleteAccount" && kgService?.deleteUserAccount) {
      await kgService.deleteUserAccount(userId)
      logger.info(`User account deleted for user ${userId}`)
      return { actionPerformed: true, action: context.action }
    }
    // Add more actions as needed
    return { actionPerformed: true, action: context.action }
  }

  // If context requests storing the confirmation in the KG
  if (context?.storeConfirmation && kgService?.recordConfirmation) {
    await kgService.recordConfirmation(userId, message, confirmed)
    logger.info(
      `Confirmation recorded for user ${userId}: ${confirmed} for "${message}"`,
    )
    return { recorded: true, message, confirmed }
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
  kgService?: any,
): Promise<any> {
  const { value, label } = data

  logger.info(
    `Form input submitted: "${value}" for field "${label}" by user ${userId}`,
  )

  // If context requests updating the user profile, do so
  if (context?.updateProfile && kgService?.updateUserProfileField) {
    await kgService.updateUserProfileField(userId, label, value)
    logger.info(
      `User profile updated for user ${userId}: ${label} = ${value}`,
    )
    return { profileUpdated: true, field: label }
  }

  // If context requests storing the input in the KG
  if (context?.storeInput && kgService?.recordFormInput) {
    await kgService.recordFormInput(userId, label, value)
    logger.info(
      `Form input recorded for user ${userId}: ${label} = ${value}`,
    )
    return { recorded: true, field: label, value }
  }

  return { processed: true, value }
}
