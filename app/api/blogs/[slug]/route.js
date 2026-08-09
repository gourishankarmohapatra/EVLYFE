const { NextResponse } = require('next/server');
const data = require('@/lib/data');

module.exports = async function GET(request, { params }) {
  const { slug } = await params;
  const blog = data.getBlogBySlug(slug);
  if (!blog) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }
  return NextResponse.json(blog);
};
