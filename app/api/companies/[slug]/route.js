import { NextResponse } from 'next/server';
import * as data from '@/lib/data';

export async function GET(request, { params }) {
  const { slug } = await params;
  const company = data.getCompanyBySlug(slug);
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 });
  }
  const vehicles = data.getVehiclesByCompanySlug(slug);
  return NextResponse.json({ company, vehicles });
}
