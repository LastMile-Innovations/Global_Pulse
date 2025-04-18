import { NextResponse } from "next/server"
import { z } from "zod"
import { rateLimit } from "@/lib/redis/rate-limit"
import { logger } from "@/lib/utils/logger"

// Define the schema for research contact requests
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

export async function POST(request: Request) {
  try {
    // Rate limiting
    const identifier = request.headers.get("x-forwarded-for") || "anonymous"
    const { success } = await rateLimit(identifier, 5, 60 * 60) // 5 requests per hour

    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Parse and validate the request body
    const body = await request.json()
    const validatedData = researchContactSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validatedData.error.format() },
        { status: 400 },
      )
    }

    const { name, email, institution, researchArea, message, collaborationType } = validatedData.data

    // Store the research contact request in the database
    // This is a placeholder - you would implement this based on your schema
    // await db.insert(researchContacts).values({
    //   name,
    //   email,
    //   institution,
    //   researchArea,
    //   message,
    //   collaborationType,
    //   createdAt: new Date(),
    // })

    // Log the request for now
    logger.info("Research contact request received", {
      name,
      email,
      institution,
      researchArea,
      collaborationType,
    })

    // Send notification email to admin (implementation would depend on your email service)
    // await sendNotificationEmail({
    //   subject: `New Research Collaboration Request: ${collaborationType}`,
    //   body: `From: ${name} (${email}) at ${institution}\nResearch Area: ${researchArea}\n\n${message}`,
    // })

    return NextResponse.json(
      {
        success: true,
        message: "Your research contact request has been received. Our team will review it and get back to you soon.",
      },
      { status: 200 },
    )
  } catch (error) {
    logger.error("Error processing research contact request", { error })
    return NextResponse.json({ error: "An unexpected error occurred. Please try again later." }, { status: 500 })
  }
}
