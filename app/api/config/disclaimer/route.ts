import { NextResponse } from 'next/server';
import { V1_PROTOTYPE_DISCLAIMER } from '@/lib/config/content-config';

export async function GET() {
  return NextResponse.json({ disclaimer: V1_PROTOTYPE_DISCLAIMER });
} 