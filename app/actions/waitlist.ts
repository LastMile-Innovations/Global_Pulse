"use server";

import { db } from '@/lib/db';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import type { NewWaitlistUser } from '@/lib/db/schema';
import { waitlist_users, waitlist_referrals, waitlist_activity_logs } from '@/lib/db/schema/waitlist';
import { logger } from "@/lib/utils/logger";
import { rateLimit, getClientIp } from "@/lib/redis/rate-limit";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth/auth-utils";

const JoinSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, "Name is required").optional(),
  interest: z.string().optional(),
  referralCode: z.string().optional(),
  emailPreferences: z.any().optional(),
  privacyAccepted: z.boolean().refine(val => val === true, {
    message: 'Privacy policy must be accepted',
  }),
});

export type JoinWaitlistResult =
  | { success: true; user: { email: string; name?: string | null; referralCode: string }; referralLink: string }
  | { success: false; error: string };

// Define specific limits for this action
const actionLimit = 5;
const actionWindow = 600; // 10 minutes
const ipFallbackLimit = 3;

export async function joinWaitlist(input: unknown): Promise<JoinWaitlistResult> {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const user = await getCurrentUser(); // Get user (might be null)

  // --- Rate Limiting ---
  const limitResult = await rateLimit(
    {
      userId: user?.id,
      ip: ip,
      path: "action:joinWaitlist", // Define a unique path for the action
    },
    {
      limit: actionLimit,
      window: actionWindow,
      keyPrefix: "action:waitlist:join", // Specific prefix for action
      ipFallback: { enabled: true, limit: ipFallbackLimit },
    },
  );

  if (limitResult?.limited) {
    logger.warn(`Server Action rate limited: [joinWaitlist]`); // Already logged in rateLimit func, extra log optional
    return { success: false, error: "Rate limit exceeded. Please try again later." };
  }
  // --- End Rate Limiting ---

  // Validate input
  const parsed = JoinSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input: ' + parsed.error.errors.map(e => e.message).join(', ') };
  }
  const { email, name, interest, referralCode, emailPreferences, privacyAccepted } = parsed.data;

  try {
    // Use transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // Check for existing user
      const [existing] = await tx
        .select()
        .from(waitlist_users)
        .where(eq(waitlist_users.email, email))
        .limit(1);

      if (existing) {
        throw new Error('Email already registered');
      }

      // Generate unique referral code
      let newReferralCode: string;
      let attempts = 0;
      do {
        newReferralCode = nanoid(10);
        const [codeExists] = await tx
          .select()
          .from(waitlist_users)
          .where(eq(waitlist_users.referralCode, newReferralCode))
          .limit(1);
        if (!codeExists) break;
        attempts++;
        if (attempts > 5) throw new Error("Failed to generate unique referral code");
      } while (true);

      // Prepare insert object
      const newUserData: NewWaitlistUser = {
        email,
        name: name ?? null,
        interest: interest ?? null,
        referralCode: newReferralCode,
        referredByCode: referralCode ?? null,
        priorityScore: 0,
        referralCount: 0,
        status: 'pending',
        emailPreferences: emailPreferences ?? null,
        privacyAccepted: privacyAccepted,
        // createdAt and updatedAt handled by schema defaults
      };

      // Insert new user
      const [newUser] = await tx.insert(waitlist_users).values(newUserData).returning();

      // Handle referral logic
      if (referralCode) {
        const [referrer] = await tx
          .select()
          .from(waitlist_users)
          .where(eq(waitlist_users.referralCode, referralCode))
          .limit(1);

        if (referrer && referrer.id !== newUser.id) {
          await tx.insert(waitlist_referrals).values({
            referrerId: referrer.id,
            referredId: newUser.id,
          });

          await tx
            .update(waitlist_users)
            .set({
              referralCount: (referrer.referralCount ?? 0) + 1,
              priorityScore: sql`${waitlist_users.priorityScore} + 10`, // MVP: static points
            })
            .where(eq(waitlist_users.id, referrer.id));
        }
      }

      // Log activity
      await tx.insert(waitlist_activity_logs).values({
        waitlistUserId: newUser.id,
        action: 'signup',
        details: { email, referralCode },
      });

      return newUser;
    });

    // Compose referral link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const referralLink = `${baseUrl}/waitlist?ref=${result.referralCode}`;

    return {
      success: true,
      user: {
        email: result.email,
        name: result.name,
        referralCode: result.referralCode,
      },
      referralLink,
    };
  } catch (error: any) {
    if (error?.message === 'Email already registered') {
      return { success: false, error: 'Email already registered' };
    }
    if (error?.message === 'Failed to generate unique referral code') {
      return { success: false, error: 'Could not generate referral code, please try again.' };
    }
    console.error("Error in joinWaitlist action:", error);
    return { success: false, error: 'An internal error occurred' };
  }
}