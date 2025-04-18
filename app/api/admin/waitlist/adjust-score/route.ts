import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist_users, waitlist_activity_logs } from '@/lib/db/schema/waitlist';
import { isAdmin } from '@/lib/auth/auth-utils';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/redis/rate-limit'; // Assuming rate limiter utility

const AdjustSchema = z.object({
  userId: z.string().uuid(),
  newScore: z.number().int(),
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
    const parsed = AdjustSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }

    const { userId, newScore } = parsed.data;

    const result = await db
      .update(waitlist_users)
      .set({ priorityScore: newScore })
      .where(eq(waitlist_users.id, userId))
      .returning({ id: waitlist_users.id }); // Check if update was successful

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await db.insert(waitlist_activity_logs).values({
      waitlistUserId: userId,
      action: 'admin_adjust_score',
      details: { newScore },
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Admin adjust score error:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}