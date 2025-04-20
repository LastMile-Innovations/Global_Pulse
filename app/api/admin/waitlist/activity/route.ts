import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist_activity_logs } from '@/lib/db/schema/waitlist';
import { isAdmin } from '@/lib/auth/auth-utils';
import { count, desc, eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { logger } from '@/lib/utils/logger';

// --- waitlist.ts a ---
// This endpoint returns waitlist activity logs for admins, with optional filtering by userId and action.
// Supports pagination via limit and offset.

const QuerySchema = z.object({
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(req: NextRequest) {
  const isUserAdmin = await isAdmin(req);
  if (!isUserAdmin) {
    logger.warn(`Unauthorized API access attempt to ${req.nextUrl.pathname}`);
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const parsedQuery = QuerySchema.safeParse({
      userId: searchParams.get('userId'),
      action: searchParams.get('action'),
      limit: searchParams.get('limit') || 50,
      offset: searchParams.get('offset') || 0,
    });

    if (!parsedQuery.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parsedQuery.error.errors }, { status: 400 });
    }

    const { userId, action, limit, offset } = parsedQuery.data;

    // Compose where clause for filtering
    const whereClause = and(
      userId ? eq(waitlist_activity_logs.waitlistUserId, userId) : undefined,
      action ? eq(waitlist_activity_logs.action, action) : undefined
    );

    // Fetch logs with pagination and ordering
    const logs = await db
      .select()
      .from(waitlist_activity_logs)
      .where(whereClause)
      .orderBy(desc(waitlist_activity_logs.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select({ value: count() })
      .from(waitlist_activity_logs)
      .where(whereClause);

    const total = totalResult[0]?.value ?? 0;

    return NextResponse.json({ logs, total });

  } catch (error: any) {
    console.error('Admin get activity logs error:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}