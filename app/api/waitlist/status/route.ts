import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schema } from '@/lib/db/schema';
import { rateLimit } from '@/lib/redis/rate-limit';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

// Use a Zod object for better error messages
const EmailQuerySchema = z.object({
  email: z.string().email(),
});

// Define specific limits for this endpoint
const endpointLimit = 5;
const endpointWindow = 600; // 10 minutes
const ipFallbackLimit = 3;

export async function GET(req: NextRequest) {
  // --- Rate Limiting ---
  const rateLimitResponse = await rateLimit(req, {
    limit: endpointLimit,
    window: endpointWindow,
    keyPrefix: "waitlist:status",
    ipFallback: { enabled: true, limit: ipFallbackLimit },
  });
  if (rateLimitResponse instanceof NextResponse) {
    return rateLimitResponse; // Returns 429 response if limited
  }
  // --- End Rate Limiting ---

  // Get email from query params
  const email = req.nextUrl.searchParams.get('email');
  const parsed = EmailQuerySchema.safeParse({ email });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid or missing email parameter' }, { status: 400 });
  }

  try {
    // Always use lowercased email for lookup
    const normalizedEmail = parsed.data.email.toLowerCase();

    const user = await db
      .select({
        id: schema.waitlist_users.id,
        status: schema.waitlist_users.status,
        priorityScore: schema.waitlist_users.priorityScore,
        referralCode: schema.waitlist_users.referralCode,
        createdAt: schema.waitlist_users.createdAt,
      })
      .from(schema.waitlist_users)
      .where(eq(schema.waitlist_users.email, normalizedEmail))
      .limit(1)
      .then(res => res[0]);

    if (!user) {
      return NextResponse.json({ status: 'not_found' }, { status: 404 });
    }

    // MVP: No position calculation, just return basic info
    return NextResponse.json({
      status: user.status,
      referralCode: user.referralCode,
      joinedAt: user.createdAt,
    });

  } catch (error: any) {
    logger.error('Error fetching waitlist status:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}