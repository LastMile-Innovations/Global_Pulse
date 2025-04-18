import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist_users, waitlist_referrals, waitlist_activity_logs } from '@/lib/db/schema';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { rateLimit } from '@/lib/redis/rate-limit'; // Assuming rate limiter utility
import { eq } from 'drizzle-orm';

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

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const parsed = JoinSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }
    const { email, name, interest, referralCode, emailPreferences, privacyAccepted } = parsed.data;

    // Use transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // Check for existing user
      const existing = await tx.query.waitlist_users.findFirst({ where: (u, { eq }) => eq(u.email, email) });
      if (existing) {
        // Throw an error to rollback transaction and return specific response
        throw new Error('Email already registered');
      }

      // Generate unique referral code
      let newReferralCode: string;
      while (true) {
        newReferralCode = nanoid(10);
        const codeExists = await tx.query.waitlist_users.findFirst({ where: (u, { eq }) => eq(u.referralCode, newReferralCode) });
        if (!codeExists) break;
      }

      // Create user
      const [newUser] = await tx.insert(waitlist_users).values({
        email,
        name,
        interest,
        referralCode: newReferralCode,
        referredByCode: referralCode,
        emailPreferences,
        privacyAccepted,
        status: 'pending',
      }).returning();

      // Handle referral
      if (referralCode) {
        const referrer = await tx.query.waitlist_users.findFirst({ where: (u, { eq }) => eq(u.referralCode, referralCode) });
        if (referrer && referrer.id !== newUser.id) {
          await tx.insert(waitlist_referrals).values({
            referrerId: referrer.id,
            referredId: newUser.id,
          });
          // Update referrer stats
          await tx.update(waitlist_users)
            .set({
              referralCount: referrer.referralCount + 1,
              priorityScore: referrer.priorityScore + 10, // TODO: Get points from settings
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

    // (Optional) Send confirmation email here

    return NextResponse.json({
      success: true,
      user: { email: result.email, name: result.name, referralCode: result.referralCode },
      referralLink: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/waitlist?ref=${result.referralCode}`,
    });

  } catch (error: any) {
    console.error('Join waitlist error:', error);
    // Handle specific transaction rollback error
    if (error.message === 'Email already registered') {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
} 