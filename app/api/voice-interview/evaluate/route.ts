import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { evaluateInterview, ChatCompletionMessageParam } from '@/lib/groq';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages, domain, topic } = await req.json() as {
    messages: ChatCompletionMessageParam[];
    domain: string;
    topic: string;
  };

  if (!messages || !domain || !topic) {
    return NextResponse.json({ error: 'messages, domain, and topic are required' }, { status: 400 });
  }

  // Build a readable transcript from the messages (skip the system prompt)
  const transcript = messages
    .filter((m) => m.role !== 'system')
    .map((m) => `${m.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
    .join('\n\n');

  try {
    const evaluation = await evaluateInterview(transcript, domain, topic);
    return NextResponse.json(evaluation);
  } catch (error: any) {
    if (error?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }
    console.error('Voice interview evaluate error:', error);
    return NextResponse.json({ error: 'Failed to evaluate interview.' }, { status: 500 });
  }
}
