import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/postgres/drizzle";
import { dataAccessRequests } from "@/lib/db/schema";
import { rateLimit } from "@/lib/redis/rate-limit";
import { auth } from "@/lib/auth/auth-utils";
import { DataAccessRequestPayloadSchema } from "@/lib/schemas/api";

/**
 * MVP Data Access Request API
 * - POST: Submit a new data access request (rate limited, authenticated)
 * - GET: List user's data access requests (authenticated)
 */

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per minute per user
  const rateLimitResult = await rateLimit(request, { limit: 5, window: 60 });
  if (rateLimitResult instanceof NextResponse) return rateLimitResult;

  try {
    // Authenticate user
    const userId = await auth(request);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = DataAccessRequestPayloadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const {
      contactName,
      organizationName,
      contactEmail,
      contactPhone,
      intentDeclaration,
      policyAcknowledged,
    } = validationResult.data;

    // Insert request into database
    const result = await db
      .insert(dataAccessRequests)
      .values({
        userId,
        contactName,
        organizationName,
        contactEmail,
        contactPhone: contactPhone || null,
        intentDeclaration,
        policyAcknowledged,
        status: "pending",
        // createdAt and updatedAt handled by defaultNow()
      })
      .returning({ id: dataAccessRequests.id });

    return NextResponse.json(
      {
        message: "Data access request submitted successfully",
        id: result[0].id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting data access request:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const userId = await auth(request);
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Query user's data access requests
    const requests = await db.query.dataAccessRequests.findMany({
      where: (dar, { eq }) => eq(dar.userId, userId),
      orderBy: (dar, { desc }) => [desc(dar.createdAt)],
    });

    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data access requests:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
