const { NextResponse } = require('next/server');
const data = require('@/lib/data');

module.exports = async function GET() {
  return NextResponse.json(data.getBrands());
};
