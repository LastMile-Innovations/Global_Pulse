import { NextResponse, type NextRequest } from "next/server";
import { sendContactEmail } from "@/lib/services/email-service";
import { z } from "zod";
import { logger } from "@/lib/utils/logger";
import { rateLimit } from "@/lib/redis/rate-limit"; // Import rateLimit

const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Define specific limits for this endpoint
const endpointLimit = 3;
const endpointWindow = 3600; // 1 hour
const ipFallbackLimit = 2;

export async function POST(request: NextRequest) {
  // --- Rate Limiting ---
  const rateLimitResponse = await rateLimit(request, {
    limit: endpointLimit,
    window: endpointWindow,
    keyPrefix: "contact",
    ipFallback: { enabled: true, limit: ipFallbackLimit },
  });
  if (rateLimitResponse instanceof NextResponse) {
    return rateLimitResponse; // Returns 429 response if limited
  }
  // --- End Rate Limiting ---

  try {
    const body = await request.json();
    const parsedData = ContactFormSchema.safeParse(body);

    if (!parsedData.success) {
      logger.warn("Invalid contact form submission:", parsedData.error.errors);
      return NextResponse.json(
        { error: "Invalid input", details: parsedData.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, message } = parsedData.data;

    await sendContactEmail({ name, email, message });

    logger.info(`Contact form submitted successfully by ${email}`);
    return NextResponse.json(
      { message: "Your message has been sent successfully!" },
      { status: 200 },
    );

  } catch (error) {
    logger.error("Error processing contact form:", error);
    if (error instanceof z.ZodError) {
      // This case should be caught by safeParse, but handle defensively
      return NextResponse.json(
        { error: "Invalid input data", details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
} 