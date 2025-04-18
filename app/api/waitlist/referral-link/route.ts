import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist_users } from '@/lib/db/schema';
import { z } from 'zod';

const EmailSchema = z.string().email();

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');
    const parsedEmail = EmailSchema.safeParse(email);

    if (!parsedEmail.success) {
      return NextResponse.json({ error: 'Invalid or missing email parameter' }, { status: 400 });
    }

    const user = await db.query.waitlist_users.findFirst({
      where: (u, { eq }) => eq(u.email, parsedEmail.data),
      columns: { referralCode: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      referralLink: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/waitlist?ref=${user.referralCode}`,
    });

  } catch (error: any) {
    console.error('Get referral link error:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
} 