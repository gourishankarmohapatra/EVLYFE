const { NextResponse } = require('next/server');
const data = require('@/lib/data');

module.exports = async function GET(request, { params }) {
  const { slug } = await params;
  const vehicle = data.getVehicleBySlug(slug);
  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
  return NextResponse.json(vehicle);
};
