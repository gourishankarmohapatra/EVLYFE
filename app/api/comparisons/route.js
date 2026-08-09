import { NextResponse } from 'next/server';
import * as data from '@/lib/data';

export async function GET() {
  return NextResponse.json({ comparisons: data.getComparisons() });
}
