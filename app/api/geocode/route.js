import { NextResponse } from 'next/server';

const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request) {
  try {
    const { lat, lng } = await request.json();

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const cacheKey = `${Math.round(lat * 100) / 100},${Math.round(lng * 100) / 100}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ city: cached.city });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'EVLYFE/1.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;

    cache.set(cacheKey, { city, timestamp: Date.now() });
    return NextResponse.json({ city });
  } catch (err) {
    return NextResponse.json({ city: null });
  }
}
