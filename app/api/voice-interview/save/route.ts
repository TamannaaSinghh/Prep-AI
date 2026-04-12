import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import VoiceInterviewSession from '@/models/VoiceInterviewSession';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  if (!userId) return NextResponse.json({ error: 'User session incomplete.' }, { status: 401 });

  try {
    await connectDB();

    const sessions = await VoiceInterviewSession.find({ userId })
      .select('domain topic subtopic totalTurns overallScore completedAt durationSeconds')
      .sort({ completedAt: -1 })
      .lean();

    const mapped = sessions.map((s: any) => ({
      _id: s._id.toString(),
      domain: s.domain,
      topic: s.topic || '',
      subtopic: s.subtopic || '',
      overallScore: s.overallScore,
      totalTurns: s.totalTurns,
      completedAt: s.completedAt,
      durationSeconds: s.durationSeconds,
    }));

    return NextResponse.json({ sessions: mapped });
  } catch (error: any) {
    console.error('Voice sessions fetch error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to load voice interview sessions.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  if (!userId) return NextResponse.json({ error: 'User session incomplete.' }, { status: 401 });

  const body = await req.json();

  try {
    await connectDB();

    const saved = await VoiceInterviewSession.create({
      userId,
      domain: body.domain,
      topic: body.topic,
      subtopic: body.subtopic || '',
      difficulty: body.difficulty,
      conversationTurns: body.conversationTurns,
      totalTurns: body.totalTurns,
      overallScore: body.overallScore,
      evaluation: body.evaluation,
      durationSeconds: body.durationSeconds,
    });

    return NextResponse.json({ id: saved._id.toString() });
  } catch (error: any) {
    console.error('Voice session save error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to save voice interview session.' }, { status: 500 });
  }
}
