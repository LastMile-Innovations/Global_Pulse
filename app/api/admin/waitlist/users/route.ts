import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist_users } from '@/lib/db/schema/waitlist';
import { isAdmin } from '@/lib/auth/auth-utils';
import { count, asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

const QuerySchema = z.object({
  status: z.enum(['pending', 'invited', 'converted', 'removed']).optional(),
  sort: z.enum(['createdAt', 'priorityScore']).default('createdAt'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const parsedQuery = QuerySchema.safeParse({
      status: searchParams.get('status'),
      sort: searchParams.get('sort') || 'createdAt',
      limit: searchParams.get('limit') || 50,
      offset: searchParams.get('offset') || 0,
    });

    if (!parsedQuery.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parsedQuery.error.errors }, { status: 400 });
    }

    const { status, sort, limit, offset } = parsedQuery.data;

    const whereClause = status ? eq(waitlist_users.status, status) : undefined;
    const orderByClause = sort === 'priorityScore'
      ? desc(waitlist_users.priorityScore)
      : asc(waitlist_users.createdAt);

    let usersQuery;
    if (whereClause) {
      usersQuery = db.select().from(waitlist_users).where(whereClause).orderBy(orderByClause, asc(waitlist_users.createdAt));
    } else {
      usersQuery = db.select().from(waitlist_users).orderBy(orderByClause, asc(waitlist_users.createdAt));
    }
    const users = await usersQuery;

    let totalResult;
    if (whereClause) {
      totalResult = await db.select({ value: count() }).from(waitlist_users).where(whereClause);
    } else {
      totalResult = await db.select({ value: count() }).from(waitlist_users);
    }
    const total = totalResult[0]?.value ?? 0;

    return NextResponse.json({ users, total });

  } catch (error: any) {
    console.error('Admin get waitlist users error:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
} 