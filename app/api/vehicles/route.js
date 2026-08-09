import { NextResponse } from 'next/server';
import * as data from '@/lib/data';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = {};
  for (const [key, value] of searchParams.entries()) {
    filters[key] = value;
  }
  const result = data.getVehicles(filters);
  return NextResponse.json(result);
}
