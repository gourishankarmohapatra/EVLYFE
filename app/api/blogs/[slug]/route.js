import { NextResponse } from 'next/server';
import * as data from '@/lib/data';

export async function GET(request, { params }) {
  const { slug } = await params;
  const blog = data.getBlogBySlug(slug);
  if (!blog) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }
  return NextResponse.json(blog);
}
