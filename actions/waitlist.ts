"use server"

import { db } from '@/lib/db';
import { schema } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import type { PostgresJsTransaction } from 'drizzle-orm/postgres-js';
import type { NewWaitlistUser } from '@/lib/db/schema';
import { waitlist_users, waitlist_referrals, waitlist_activity_logs } from '@/lib/db/schema/waitlist';

const JoinSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
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

export async function joinWaitlist(input: unknown): Promise<JoinWaitlistResult> {
  // Validate input
  const parsed = JoinSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: 'Invalid input: ' + parsed.error.errors.map(e => e.message).join(', ') };
  }
  const { email, name, interest, referralCode, emailPreferences, privacyAccepted } = parsed.data;

  try {
    // Use transaction for atomicity, add explicit type for tx
    const result = await db.transaction(async (tx) => { 
      // Check for existing user using waitlist_users
      const [existing] = await tx.select().from(waitlist_users).where(eq(waitlist_users.email, email)).limit(1);
      if (existing) {
        throw new Error('Email already registered');
      }
      // Generate unique referral code
      let newReferralCode: string;
      while (true) {
        newReferralCode = nanoid(10);
        const [codeExists] = await tx.select().from(waitlist_users).where(eq(waitlist_users.referralCode, newReferralCode)).limit(1);
        if (!codeExists) break;
      }
      // Prepare insert object with all schema fields
      const newUserData: NewWaitlistUser = {
        email,
        name,
        interest,
        referralCode: newReferralCode,
        referredByCode: referralCode,
        priorityScore: 0,
        referralCount: 0,
        status: 'pending',
        emailPreferences: emailPreferences ?? null,
        privacyAccepted: privacyAccepted,
        // createdAt and updatedAt are set by default in schema
      };
      // Create user using waitlist_users
      const [newUser] = await tx.insert(waitlist_users).values(newUserData).returning();
      // Handle referral
      if (referralCode) {
        const [referrer] = await tx.select().from(waitlist_users).where(eq(waitlist_users.referralCode, referralCode)).limit(1);
        if (referrer && referrer.id !== newUser.id) {
          await tx.insert(waitlist_referrals).values({
            referrerId: referrer.id,
            referredId: newUser.id,
          });
          await tx.update(waitlist_users)
            .set({
              referralCount: referrer.referralCount + 1,
              priorityScore: sql`${waitlist_users.priorityScore} + 10`, // TODO: Get points from settings
            })
            .where(eq(waitlist_users.id, referrer.id));
        }
      }
      // Log activity using waitlist_activity_logs
      await tx.insert(waitlist_activity_logs).values({
        waitlistUserId: newUser.id,
        action: 'signup',
        details: { email, referralCode },
      });
      return newUser;
    });
    // (Optional) Send confirmation email here
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/waitlist?ref=${result.referralCode}`;
    return {
      success: true,
      user: { email: result.email, name: result.name, referralCode: result.referralCode },
      referralLink,
    };
  } catch (error: any) {
    // Add logging for internal errors
    if (error.message === 'Email already registered') {
      return { success: false, error: 'Email already registered' };
    }
    console.error("Error in joinWaitlist action:", error); // Log internal errors
    return { success: false, error: 'An internal error occurred' };
  }
} 