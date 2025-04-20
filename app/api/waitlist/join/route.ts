import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { schema } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/utils/logger';
import { nanoid } from 'nanoid';
import { rateLimit } from '@/lib/redis/rate-limit';
import { redis } from '@/lib/redis/client';
import { sql } from 'drizzle-orm';

const JoinSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  interest: z.string().optional(),
  referralCode: z.string().optional(),
  emailPreferences: z.any().optional(),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: 'Privacy policy must be accepted'
  }),
});

// Define specific limits for this endpoint
const endpointLimit = 5;
const endpointWindow = 600; // 10 minutes
const ipFallbackLimit = 3;

export async function POST(req: NextRequest) {
  // --- Rate Limiting ---
  const rateLimitResponse = await rateLimit(req, {
    limit: endpointLimit,
    window: endpointWindow,
    keyPrefix: "waitlist:join",
    ipFallback: { enabled: true, limit: ipFallbackLimit },
  });
  if (rateLimitResponse instanceof NextResponse) {
    return rateLimitResponse; // Returns 429 response if limited
  }
  // --- End Rate Limiting ---

  try {
    const body = await req.json();
    const parsed = JoinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }
    const { email, name, interest, referralCode, emailPreferences, privacyAccepted } = parsed.data;

    // Use a variable to store the response if we need to return early from inside the transaction
    let earlyResponse: Response | null = null;

    await db.transaction(async (tx) => {
      // Check if email exists
      const existing = await tx.select({ id: schema.waitlist_users.id })
        .from(schema.waitlist_users)
        .where(eq(schema.waitlist_users.email, email))
        .limit(1)
        .then(res => res[0]);

      if (existing) {
        logger.info(`Waitlist signup attempt for existing email: ${email}`);
        // Set early response and return to break out of transaction
        earlyResponse = NextResponse.json({ success: true, message: 'Signup request received.' });
        return;
      }

      // Generate unique referral code
      let newReferralCode: string | null = null;
      let codeExists = true;
      while (codeExists) {
        const candidate = nanoid(10);
        const found = await tx.select({ id: schema.waitlist_users.id })
          .from(schema.waitlist_users)
          .where(eq(schema.waitlist_users.referralCode, candidate))
          .limit(1)
          .then(res => res[0]);
        if (!found) {
          newReferralCode = candidate;
          codeExists = false;
        }
      }

      // Defensive: should never happen, but TS check
      if (!newReferralCode) {
        throw new Error("Failed to generate unique referral code.");
      }

      // Handle referral code if provided
      let referrerId: string | null = null;
      let referrerScoreIncrement = 0;
      if (referralCode) {
        const referrer = await tx.select({
          id: schema.waitlist_users.id,
          priorityScore: schema.waitlist_users.priorityScore
        })
          .from(schema.waitlist_users)
          .where(eq(schema.waitlist_users.referralCode, referralCode))
          .limit(1)
          .then(res => res[0]);

        if (referrer) {
          referrerId = referrer.id;
          // Fetch the referral bonus from settings or use a default
          let referralBonus = 10;
          try {
            const bonusSetting = await redis.get('waitlist:referral_bonus');
            if (typeof bonusSetting === 'string') {
              const parsedBonus = parseInt(bonusSetting, 10);
              if (!isNaN(parsedBonus)) {
                referralBonus = parsedBonus;
              }
            }
          } catch (redisError) {
            logger.error('Failed to fetch referral bonus from Redis:', redisError);
          }

          referrerScoreIncrement = referralBonus;
          await tx.update(schema.waitlist_users)
            .set({
              priorityScore: sql`${schema.waitlist_users.priorityScore} + ${referrerScoreIncrement}`,
              referralCount: sql`${schema.waitlist_users.referralCount} + 1`,
            })
            .where(eq(schema.waitlist_users.id, referrerId));

          logger.info(`Applied referral bonus (${referrerScoreIncrement}) to referrer ${referrerId} for new user ${email}`);
        } else {
          logger.warn(`Invalid referral code used during signup: ${referralCode}`);
        }
      }

      // Insert new user
      const newUser = await tx.insert(schema.waitlist_users).values({
        email,
        name,
        interest,
        referralCode: newReferralCode,
        referredByCode: referralCode ?? null,
        priorityScore: 1 + referrerScoreIncrement,
        privacyAccepted: privacyAccepted,
        emailPreferences: emailPreferences ?? null,
      }).returning({ id: schema.waitlist_users.id });

      const newUserId = newUser[0]?.id;

      if (!newUserId) {
        throw new Error("Failed to insert new waitlist user.");
      }

      // Insert referral record if applicable
      if (referrerId) {
        await tx.insert(schema.waitlist_referrals).values({
          referrerId: referrerId,
          referredId: newUserId,
        });
      }

      // Log activity
      await tx.insert(schema.waitlist_activity_logs).values({
        waitlistUserId: newUserId,
        action: 'signup',
        details: {
          name: name ?? null,
          email,
          interest: interest ?? null,
          referralCode: referralCode ?? null,
          referrerId: referrerId ?? null
        },
      });

      logger.info(`New waitlist user signed up: ${email}, ID: ${newUserId}`);
    });

    // If earlyResponse was set (user already existed), return it
    if (earlyResponse) {
      return earlyResponse;
    }

    return NextResponse.json({ success: true, message: 'Successfully joined the waitlist!' });

  } catch (error: any) {
    logger.error('Error joining waitlist:', error);
    return NextResponse.json({ error: 'An error occurred while joining the waitlist.' }, { status: 500 });
  }
}