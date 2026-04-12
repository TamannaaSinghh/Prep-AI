import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateTopics } from '@/lib/groq';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { domain } = body;

  if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
    return NextResponse.json({ error: 'domain is required' }, { status: 400 });
  }

  try {
    const topics = await generateTopics({ domain: domain.trim() });

    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: 'Could not generate topics for this domain. Try again.' }, { status: 422 });
    }

    // Ensure all items are strings
    const cleaned = topics.filter((t): t is string => typeof t === 'string' && t.trim().length > 0);

    return NextResponse.json({ topics: cleaned });
  } catch (error: any) {
    if (error?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment and try again.' }, { status: 429 });
    }
    if (error?.status === 401) {
      return NextResponse.json({ error: 'AI service authentication failed. Check GROQ_API_KEY.' }, { status: 500 });
    }
    console.error('Topics generation error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to generate topics. Please try again.' }, { status: 500 });
  }
}
