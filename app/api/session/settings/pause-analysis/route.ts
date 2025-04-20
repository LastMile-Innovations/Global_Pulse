import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth/auth-utils';
import { setAnalysisPaused } from '@/lib/redis/client';
import { rateLimit } from '@/lib/redis/rate-limit';

const PauseAnalysisSchema = z.object({
  sessionId: z.string().uuid(),
  paused: z.boolean(),
});

export async function PUT(request: NextRequest) {
  // --- Rate Limiting ---
  const userId = await auth(request);
  const rateLimitResult = await rateLimit(request, {
    limit: 10,
    window: 60,
    keyPrefix: 'session:pause-analysis',
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

  const parsed = PauseAnalysisSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { sessionId, paused } = parsed.data;

  // (Optional) TODO: Verify sessionId belongs to userId for extra security

  try {
    await setAnalysisPaused(sessionId, paused);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error setting analysis paused state:', err);
    return NextResponse.json({ error: 'Failed to update analysis pause state' }, { status: 500 });
  }
} 