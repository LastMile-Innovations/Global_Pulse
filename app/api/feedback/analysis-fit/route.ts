import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth-utils';
import { db } from '@/lib/db/db';
import { rateLimit } from '@/lib/redis/rate-limit';
import { analysis_feedback } from '@/lib/db/schema/feedback';

const FeedbackSchema = z.object({
  assistantInteractionId: z.string().uuid(),
  fitsExperience: z.boolean(),
});

export async function POST(request: NextRequest) {
  // --- Rate Limiting ---
  const userId = await auth(request);
  const rateLimitResult = await rateLimit(request, {
    limit: 20,
    window: 60,
    keyPrefix: 'feedback:analysis-fit',
    ipFallback: { enabled: false },
  });
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }
  // --- End Rate Limiting ---

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = FeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { assistantInteractionId, fitsExperience } = parsed.data;

  // (Optional) TODO: Verify assistantInteractionId exists and belongs to user's session

  try {
    await db.insert(analysis_feedback).values({
      user_id: userId,
      assistant_interaction_id: assistantInteractionId,
      fits_experience: fitsExperience,
    });
    // Optionally log the feedback event
    console.info('Analysis fit feedback submitted', {
      userId,
      assistantInteractionId,
      fitsExperience,
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Error inserting analysis fit feedback:', err);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
} 