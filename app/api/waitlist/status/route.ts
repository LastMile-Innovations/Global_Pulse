import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist_users, waitlist_activity_logs } from '@/lib/db/schema';
import { z } from 'zod';
import { rateLimit } from '@/lib/redis/rate-limit'; // Assuming rate limiter utility
import { sql, desc, asc, count } from 'drizzle-orm';

const StatusSchema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const parsed = StatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }
    const { email } = parsed.data;

    const user = await db.query.waitlist_users.findFirst({ where: (u, { eq }) => eq(u.email, email) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate position using a window function for efficiency
    // Note: This requires PostgreSQL
    const positionQuery = sql`
      SELECT position
      FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY priority_score DESC, created_at ASC) as position
        FROM waitlist_users
      ) as ranked_users
      WHERE id = ${user.id}
    `;
    // Directly execute the raw SQL query
    const positionResult: Array<{ position: number | null }> = await db.execute(positionQuery);
    const position = positionResult[0]?.position ?? null;

    if (position === null) {
      console.warn('Could not determine waitlist position for user:', user.id);
      // Decide how to handle this - maybe return null or default position?
    }

    // Log status check
    await db.insert(waitlist_activity_logs).values({
      waitlistUserId: user.id,
      action: 'status_check',
      details: { email },
    });

    return NextResponse.json({
      position,
      score: user.priorityScore,
      referralCount: user.referralCount,
      referralLink: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/waitlist?ref=${user.referralCode}`,
      status: user.status,
    });

  } catch (error: any) {
    console.error('Check status error:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
} 