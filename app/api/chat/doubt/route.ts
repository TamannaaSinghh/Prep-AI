import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatDoubt, DoubtChatMessage, DoubtChatContext } from '@/lib/groq';

const MAX_MESSAGES = 20;       // cap history so prompts stay small
const MAX_USER_MSG_LEN = 2000; // guard against giant pastes

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    messages?: DoubtChatMessage[];
    context?: DoubtChatContext;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const rawMessages = body.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return NextResponse.json(
      { error: 'messages array is required.' },
      { status: 400 }
    );
  }

  // Sanitize + validate.
  const messages: DoubtChatMessage[] = rawMessages
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string'
    )
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_USER_MSG_LEN),
    }))
    .slice(-MAX_MESSAGES);

  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json(
      { error: 'Last message must be from the user.' },
      { status: 400 }
    );
  }

  try {
    const reply = await chatDoubt(messages, body.context);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Doubt chat error:', error?.message || error);
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'The AI is a bit busy — please try again in a moment.' },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to get a reply. Please try again.' },
      { status: 500 }
    );
  }
}
