import { NextResponse } from 'next/server';
import * as data from '@/lib/data';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const city = searchParams.get('city');
  const result = data.getChargingStations(state, city);
  return NextResponse.json({ charging_stations: result, states: data.getChargingStates(), cities_by_state: {} });
}
