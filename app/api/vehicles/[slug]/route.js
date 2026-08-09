import { NextResponse } from 'next/server';
import * as data from '@/lib/data';

export async function GET(request, { params }) {
  const { slug } = await params;
  const vehicle = data.getVehicleBySlug(slug);
  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
  return NextResponse.json(vehicle);
}
