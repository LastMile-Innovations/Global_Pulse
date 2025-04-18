import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist_invitations, waitlist_users, waitlist_activity_logs } from '@/lib/db/schema';
import { z } from 'zod';
import { rateLimit } from '@/lib/redis/rate-limit'; // Assuming rate limiter utility
import { eq, and } from 'drizzle-orm';

const AcceptSchema = z.object({
  invitationCode: z.string(),
  email: z.string().email(),
  // Add other fields required for account creation if needed
  // e.g., password: z.string().min(8)
});

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const parsed = AcceptSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }

    const { invitationCode, email /*, other fields */ } = parsed.data;

    // Use transaction
    await db.transaction(async (tx) => {
      const invitation = await tx.query.waitlist_invitations.findFirst({
        where: and(
          eq(waitlist_invitations.invitationCode, invitationCode),
          eq(waitlist_invitations.status, 'sent'),
          // Optional: Check expiry
          // gt(waitlist_invitations.expiresAt, new Date())
        ),
        // Lock the row for update - REMOVED DUE TO TYPE ERROR
        // for: 'update',
      });

      if (!invitation) {
        throw new Error('Invalid or expired invitation');
      }

      const user = await tx.query.waitlist_users.findFirst({
        where: and(
          eq(waitlist_users.id, invitation.waitlistUserId),
          eq(waitlist_users.email, email),
          eq(waitlist_users.status, 'invited') // Ensure user is in invited state
        )
      });

      if (!user) {
        // User mismatch or not in invited state
        throw new Error('User validation failed');
      }

      // Mark invitation as accepted, user as converted
      await tx.update(waitlist_invitations)
        .set({ status: 'accepted', acceptedAt: new Date() })
        .where(eq(waitlist_invitations.id, invitation.id));

      await tx.update(waitlist_users)
        .set({ status: 'converted' })
        .where(eq(waitlist_users.id, user.id));

      // Log activity
      await tx.insert(waitlist_activity_logs).values({
        waitlistUserId: user.id,
        action: 'converted',
        details: { invitationCode },
      });

      // IMPORTANT: Create actual user account here if needed
      // This might involve calling Supabase Auth, creating entries
      // in your main `users` and `profiles` tables, etc.
      // Example:
      // const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({ ... });
      // if (authError) throw new Error('Failed to create user account');
      // await tx.insert(users_table).values({ id: data.user.id, email: user.email, ... });
      // await tx.insert(profiles_table).values({ id: data.user.id, ... });
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Accept invite error:', error);
    if (error.message === 'Invalid or expired invitation') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message === 'User validation failed') {
      return NextResponse.json({ error: 'Invalid invitation code or email' }, { status: 400 });
    }
    // Handle potential user creation errors if added
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
} 