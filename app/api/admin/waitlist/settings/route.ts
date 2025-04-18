import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { waitlist_settings, waitlist_activity_logs } from '@/lib/db/schema';
import { isAdmin, getCurrentUser } from '@/lib/auth';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/redis/rate-limit'; // Assuming rate limiter utility

// Define known setting keys and their expected types for validation
const SettingsValueSchema = z.discriminatedUnion('key', [
  z.object({ key: z.literal('referralPoints'), value: z.number().int().positive() }),
  z.object({ key: z.literal('maxReferralPoints'), value: z.number().int().positive() }),
  z.object({ key: z.literal('invitationExpiresDays'), value: z.number().int().positive() }),
  z.object({ key: z.literal('waitlistActive'), value: z.boolean() }),
  // Add other known settings here
]);

// Schema for updating a single setting
const UpdateSettingSchema = SettingsValueSchema;

export async function GET(req: NextRequest) {
  // Settings might be readable by non-admins depending on requirements
  // if (!(await isAdmin())) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const settings = await db.query.waitlist_settings.findMany();
    // Convert to key-value object for easier frontend consumption
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
    return NextResponse.json(settingsObj);
  } catch (error: any) {
    console.error('Admin get settings error:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Apply rate limiting (using admin limits)
  const rateLimitResponse = await rateLimit(req, { limit: 50, window: 60 });
  if (rateLimitResponse instanceof Response) return rateLimitResponse;

  try {
    const body = await req.json();
    const parsed = UpdateSettingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.errors }, { status: 400 });
    }

    const { key, value } = parsed.data;

    // Upsert the setting
    await db
      .insert(waitlist_settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: waitlist_settings.key, set: { value } });

    // Log activity
    const adminUser = await getCurrentUser();
    await db.insert(waitlist_activity_logs).values({
      action: 'admin_update_setting',
      details: { key, value, adminId: adminUser?.id },
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Admin update setting error:', error);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
} 