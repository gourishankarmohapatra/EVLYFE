const { NextResponse } = require('next/server');

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

module.exports = async function GET() {
  const now = Date.now();

  if (cache.data && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const rssUrl = 'https://news.google.com/rss/search?q=electric+vehicle+india&hl=en-IN&gl=IN&ceid=IN:en';
    const response = await fetch(rssUrl, {
      headers: { 'User-Agent': 'EVLYFE/1.0' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error('RSS fetch failed');

    const text = await response.text();

    const parseXML = (xml) => {
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;

      while ((match = itemRegex.exec(xml)) !== null && items.length < 20) {
        const itemXml = match[1];
        const getTag = (tag) => {
          const m = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
          return m ? m[1].trim() : '';
        };

        const title = getTag('title');
        const link = getTag('link');
        const pubDate = getTag('pubDate');
        const source = getTag('source');

        let image = '';
        const mediaMatch = itemXml.match(/<media:content[^>]+url="([^"]+)"/);
        if (mediaMatch) {
          image = mediaMatch[1];
        } else {
          const encMatch = itemXml.match(/<enclosure[^>]+url="([^"]+)"/);
          if (encMatch) image = encMatch[1];
        }

        items.push({
          title: escapeHtml(title),
          link,
          pubDate,
          source: escapeHtml(source || 'Google News'),
          image,
        });
      }
      return items;
    };

    const items = parseXML(text);
    cache = { data: items, timestamp: now };
    return NextResponse.json(items);
  } catch (err) {
    if (cache.data) {
      return NextResponse.json(cache.data);
    }
    return NextResponse.json([]);
  }
};
