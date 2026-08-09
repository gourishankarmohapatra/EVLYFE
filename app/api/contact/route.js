const { NextResponse } = require('next/server');

const submissions = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[\+]?[0-9\s\-\(\)]{7,15}$/.test(phone);
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const VALID_SUBJECTS = ['general', 'business', 'dealer', 'support', 'feedback', 'advertising', 'other'];

module.exports = async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const now = Date.now();
    const userSubs = submissions.get(ip) || [];
    const recentSubs = userSubs.filter((t) => now - t < RATE_WINDOW);
    if (recentSubs.length >= RATE_LIMIT) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, phone, city, subject, message } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
    }
    if (!subject || !VALID_SUBJECTS.includes(subject)) {
      return NextResponse.json({ error: 'Please select a valid subject.' }, { status: 400 });
    }
    if (!message || message.trim().length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 });
    }

    const sanitized = {
      name: escapeHtml(name.trim()),
      email: escapeHtml(email.trim()),
      phone: escapeHtml(phone.trim()),
      city: escapeHtml((city || '').trim()),
      subject: escapeHtml(subject),
      message: escapeHtml(message.trim()),
      timestamp: new Date().toISOString(),
      ip,
    };

    recentSubs.push(now);
    submissions.set(ip, recentSubs);

    console.log('[CONTACT FORM]', JSON.stringify(sanitized, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message. We will get back to you within 24 hours.',
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
};
