import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { rateLimit } from "@/lib/redis/rate-limit"
import { logger } from "@/lib/utils/logger"

/**
 * POST /api/research-contact
 * Accepts a research contact request, validates, rate-limits, logs, and (MVP) returns success.
 */
const researchContactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  institution: z.string().min(2, "Institution is required"),
  researchArea: z.string().min(2, "Research area is required"),
  message: z.string().min(10, "Message is required (min 10 characters)"),
  collaborationType: z.enum([
    "framework-validation",
    "algorithm-development",
    "open-source",
    "ethical-ai",
    "data-access",
    "other",
  ]),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    // --- Rate limiting using new API ---
    const rateLimitResponse = await rateLimit(request, {
      limit: 5,
      window: 60 * 60, // 1 hour
      keyPrefix: "research_contact",
      includeHeaders: true,
      ipFallback: { enabled: true, limit: 3 }, // fallback for unauthenticated/IP
    })
    if (rateLimitResponse instanceof NextResponse) {
      // If rate limited, return the standardized response
      return rateLimitResponse
    }

    // --- Parse and validate the request body ---
    let body: unknown
    try {
      body = await request.json()
    } catch (err) {
      logger.warn("Invalid JSON in research contact request")
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      )
    }

    const validatedData = researchContactSchema.safeParse(body)
    if (!validatedData.success) {
      logger.warn("Validation failed for research contact request")
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.format() },
        { status: 400 }
      )
    }

    const {
      name,
      email,
      institution,
      researchArea,
      message,
      collaborationType,
    } = validatedData.data

    // --- MVP: Log the request (do not store in DB or send email yet) ---
    logger.info(
      "Research contact request received: " +
        JSON.stringify({
          name,
          email,
          institution,
          researchArea,
          collaborationType,
        })
    )

    // --- MVP: Return success response ---
    return NextResponse.json(
      {
        success: true,
        message:
          "Your research contact request has been received. Our team will review it and get back to you soon.",
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error("Error processing research contact request", error)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    )
  }
}
