import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { conductInterviewTurn, ChatCompletionMessageParam } from '@/lib/groq';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { domain, topic, subtopic, difficulty } = await req.json();

  if (!domain || !topic || !difficulty) {
    return NextResponse.json({ error: 'domain, topic, and difficulty are required' }, { status: 400 });
  }

  const subtopicContext = subtopic ? ` with a focus on ${subtopic}` : '';

  const systemPrompt = `You are a senior technical interviewer conducting a voice interview on "${topic}" in the domain of "${domain}"${subtopicContext}.
Difficulty level: ${difficulty}.

Rules:
- Ask one question at a time.
- After the candidate answers, either ask a follow-up question to dig deeper, or move on to a new area if satisfied.
- Be conversational and encouraging but rigorous.
- Keep your responses concise (2-3 sentences max) since they will be spoken aloud.
- After about 5 main questions (with follow-ups), wrap up by saying exactly: "That concludes our interview today."
- Start by greeting the candidate briefly and asking your first question.`;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  try {
    const aiText = await conductInterviewTurn(messages);
    messages.push({ role: 'assistant', content: aiText });

    return NextResponse.json({ aiText, messages });
  } catch (error: any) {
    if (error?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }
    console.error('Voice interview start error:', error);
    return NextResponse.json({ error: 'Failed to start voice interview.' }, { status: 500 });
  }
}
