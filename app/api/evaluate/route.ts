import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { evaluateAnswer } from '@/lib/groq';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { question, userAnswer, domain } = await req.json();

  if (!question || !userAnswer || !domain) {
    return NextResponse.json({ error: 'question, userAnswer, and domain are required' }, { status: 400 });
  }

  try {
    const result = await evaluateAnswer({ question, userAnswer, domain });
    return NextResponse.json(result);
  } catch (error: any) {
    if (error?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }
    console.error('Evaluation error:', error);
    return NextResponse.json({ error: 'AI service unavailable.' }, { status: 500 });
  }
}
