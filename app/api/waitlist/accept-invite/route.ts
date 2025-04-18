import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  waitlist_invitations,
  waitlist_users,
} from '@/lib/db/schema/waitlist';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/utils/logger';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/redis/rate-limit';

const AcceptSchema = z.object({
  invitationCode: z.string(),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  // Apply rate limiting using the new options object signature
  const rateLimitResponse = await rateLimit(req, {
    limit: 5,
    window: 60,
    keyPrefix: "waitlist-accept-invite",
    ipFallback: { enabled: true, limit: 3, window: 60 },
    includeHeaders: true,
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const parsed = AcceptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }

    const { invitationCode, email, password } = parsed.data;

    // Use transaction for atomicity
    let invitation: typeof waitlist_invitations.$inferSelect | undefined;
    let waitlistUser: typeof waitlist_users.$inferSelect | undefined;
    await db.transaction(async (tx) => {
      // Find invitation and join user
      const result = await tx
        .select({
          invitation: waitlist_invitations,
          user: waitlist_users,
        })
        .from(waitlist_invitations)
        .where(and(
          eq(waitlist_invitations.invitationCode, invitationCode),
          eq(waitlist_invitations.status, 'sent')
        ))
        .leftJoin(
          waitlist_users,
          eq(waitlist_invitations.waitlistUserId, waitlist_users.id)
        )
        .limit(1);

      if (!result.length || !result[0].user) {
        throw new Error('Invalid or expired invitation code.');
      }

      invitation = result[0].invitation;
      waitlistUser = result[0].user;

      // Check if invitation expired
      const now = new Date();
      if (invitation.expiresAt && invitation.expiresAt < now) {
        await tx.update(waitlist_invitations)
          .set({ status: 'expired' })
          .where(eq(waitlist_invitations.id, invitation.id));
        throw new Error('Invitation code has expired.');
      }

      // Check email matches
      if (waitlistUser.email.toLowerCase() !== email.toLowerCase()) {
        throw new Error('Invitation code and email do not match.');
      }

      // Update invitation and user status
      await tx.update(waitlist_invitations)
        .set({ status: 'accepted', acceptedAt: now })
        .where(eq(waitlist_invitations.id, invitation.id));

      await tx.update(waitlist_users)
        .set({ status: 'converted' })
        .where(eq(waitlist_users.id, waitlistUser.id));
    });

    // Create Supabase user (outside transaction)
    if (!waitlistUser) {
      logger.error('waitlistUser is undefined after transaction');
      return NextResponse.json({ error: 'Failed to create user account.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: waitlistUser.email,
      password,
      email_confirm: true,
      user_metadata: { name: waitlistUser.name },
    });

    if (signUpError || !signUpData?.user) {
      logger.error('Error creating Supabase user during invite acceptance:', signUpError);
      // Optionally: revert DB status if needed
      return NextResponse.json({ error: 'Failed to create user account.' }, { status: 500 });
    }

    logger.info(`Supabase user created for waitlist user: ${waitlistUser.id}`);

    return NextResponse.json({ success: true, message: 'Invitation accepted successfully. You can now log in.' });

  } catch (error: any) {
    logger.error('Accept invite error:', error);
    if (
      error.message === 'Invalid or expired invitation code.' ||
      error.message === 'Invitation code has expired.' ||
      error.message === 'Invitation code and email do not match.'
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}