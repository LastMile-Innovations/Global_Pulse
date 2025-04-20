import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { schema } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/utils/logger';
import { rateLimit } from "@/lib/redis/rate-limit";

const EmailSchema = z.object({ email: z.string().email() });

// Define specific limits for this endpoint
const endpointLimit = 5;
const endpointWindow = 600; // 10 minutes
const ipFallbackLimit = 3;

export async function POST(req: NextRequest) {
  // --- Rate Limiting ---
  const rateLimitResponse = await rateLimit(req, {
    limit: endpointLimit,
    window: endpointWindow,
    keyPrefix: "waitlist:referral",
    ipFallback: { enabled: true, limit: ipFallbackLimit },
  });
  if (rateLimitResponse instanceof NextResponse) {
    return rateLimitResponse; // Returns 429 response if limited
  }
  // --- End Rate Limiting ---

  try {
    const body = await req.json();
    const parsed = EmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email provided' }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();

    // Find the user by email (case-insensitive)
    const user = await db
      .select({ referralCode: schema.waitlist_users.referralCode })
      .from(schema.waitlist_users)
      .where(eq(schema.waitlist_users.email, email))
      .limit(1)
      .then(res => res[0]);

    if (!user) {
      return NextResponse.json({ error: 'User not found on waitlist' }, { status: 404 });
    }

    if (!user.referralCode) {
      logger.warn(`User ${email} found on waitlist but has no referral code.`);
      return NextResponse.json({ error: 'Referral link not available for this user' }, { status: 404 });
    }

    // Defensive: ensure base URL is set
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      logger.error('NEXT_PUBLIC_BASE_URL is not set in environment variables');
      return NextResponse.json({ error: 'Referral link cannot be generated at this time' }, { status: 500 });
    }

    const referralLink = `${baseUrl.replace(/\/$/, '')}/waitlist?ref=${encodeURIComponent(user.referralCode)}`;

    return NextResponse.json({ referralLink });
  } catch (error: any) {
    logger.error('Error fetching referral link:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}