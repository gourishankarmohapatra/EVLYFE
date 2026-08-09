const { NextResponse } = require('next/server');
const data = require('@/lib/data');

module.exports = async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filters = {};
  for (const [key, value] of searchParams.entries()) {
    filters[key] = value;
  }
  const result = data.getCompanies(filters);
  return NextResponse.json(result);
};
