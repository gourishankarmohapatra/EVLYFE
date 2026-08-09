const { NextResponse } = require('next/server');
const data = require('@/lib/data');

module.exports = async function GET(request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const city = searchParams.get('city');
  const result = data.getDealers(state, city);
  return NextResponse.json({ dealers: result, states: data.getStates(), cities_by_state: {} });
};
