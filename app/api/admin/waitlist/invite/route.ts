import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist_invitations, waitlist_users, waitlist_activity_logs } from '@/lib/db/schema/waitlist';
import { isAdmin } from '@/lib/auth/auth-utils';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { eq, inArray, and } from 'drizzle-orm';
import { rateLimit } from '@/lib/redis/rate-limit'; // Assuming rate limiter utility

const InviteSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
  batchId: z.number().int().optional(),
  expiresInDays: z.number().int().optional(),
});

export async function POST(req: NextRequest) {
  // Pass the request to isAdmin for proper authentication
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Apply rate limiting (using admin limits)
  const rateLimitResponse = await rateLimit(req, { limit: 50, window: 60 });
  if (rateLimitResponse instanceof Response) return rateLimitResponse;

  try {
    const body = await req.json();
    const parsed = InviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }

    const { userIds, batchId, expiresInDays } = parsed.data;
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86400 * 1000) : null;

    const invited: { userId: string; code: string }[] = [];
    const errors: { userId: string; error: string }[] = [];

    // Fetch users to invite in one query
    const usersToInvite = await db
      .select()
      .from(waitlist_users)
      .where(and(inArray(waitlist_users.id, userIds), eq(waitlist_users.status, 'pending')));

    const foundUserIds = new Set(usersToInvite.map((u: any) => u.id));

    await db.transaction(async (tx) => {
      for (const user of usersToInvite) {
        let code: string;
        while (true) {
          code = nanoid(16);
          const exists = await tx
            .select()
            .from(waitlist_invitations)
            .where(eq(waitlist_invitations.invitationCode, code))
            .then((rows) => rows[0]);
          if (!exists) break;
        }

        await tx.insert(waitlist_invitations).values({
          waitlistUserId: user.id,
          invitationCode: code,
          status: 'sent',
          sentAt: new Date(),
          expiresAt,
          batchId,
        });

        await tx
          .update(waitlist_users)
          .set({ status: 'invited' })
          .where(eq(waitlist_users.id, user.id));

        await tx.insert(waitlist_activity_logs).values({
          waitlistUserId: user.id,
          action: 'invite_sent',
          details: { code, batchId },
        });

        // Add to successful list
        invited.push({ userId: user.id, code });

        // TODO: Trigger email sending for the user (user.email, code)
        // Consider batching or background jobs for large numbers
      }

      // Handle users not found or not pending
      for (const requestedId of userIds) {
        if (!foundUserIds.has(requestedId)) {
          // Need to check if user exists but isn't pending, or doesn't exist at all
          const userExists = await tx
            .select({ status: waitlist_users.status })
            .from(waitlist_users)
            .where(eq(waitlist_users.id, requestedId))
            .then((rows) => rows[0]);
          if (!userExists) {
            errors.push({ userId: requestedId, error: 'User not found' });
          } else if (userExists.status !== 'pending') {
            errors.push({ userId: requestedId, error: `User status is ${userExists.status}` });
          }
        }
      }
    });

    return NextResponse.json({ invited, errors });

  } catch (error: any) {
    console.error('Admin invite error:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}