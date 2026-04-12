import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { transcribeAudio, conductInterviewTurn, ChatCompletionMessageParam } from '@/lib/groq';

const CONCLUDE_PHRASE = 'concludes our interview';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const audioFile = formData.get('audio') as File | null;
  const messagesJson = formData.get('messages') as string | null;

  if (!audioFile || !messagesJson) {
    return NextResponse.json({ error: 'audio and messages are required' }, { status: 400 });
  }

  let messages: ChatCompletionMessageParam[];
  try {
    messages = JSON.parse(messagesJson);
  } catch {
    return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
  }

  try {
    // 1. Transcribe user's audio
    const transcript = await transcribeAudio(audioFile);

    if (!transcript || transcript.trim().length === 0) {
      messages.push({ role: 'user', content: '(silence - no response detected)' });
      const aiText = await conductInterviewTurn(messages);
      messages.push({ role: 'assistant', content: aiText });

      return NextResponse.json({
        transcript: '',
        aiText,
        messages,
        isComplete: false,
      });
    }

    // 2. Add user's response to conversation
    messages.push({ role: 'user', content: transcript });

    // 3. Get AI's follow-up/next question
    const aiText = await conductInterviewTurn(messages);
    messages.push({ role: 'assistant', content: aiText });

    // 4. Check if interview is complete
    const isComplete = aiText.toLowerCase().includes(CONCLUDE_PHRASE);

    return NextResponse.json({
      transcript,
      aiText,
      messages,
      isComplete,
    });
  } catch (error: any) {
    if (error?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }
    console.error('Voice interview respond error:', error);
    return NextResponse.json({ error: 'Failed to process response.' }, { status: 500 });
  }
}
