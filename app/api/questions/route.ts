import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateQuestions } from '@/lib/groq';
import { connectDB } from '@/lib/mongodb';
import QuestionSession from '@/models/QuestionSession';
import { recordActivity } from '@/lib/userProgress';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { domain, topic, subtopic, difficulty, count = 10, role } = await req.json();

  if (!domain || !topic || !difficulty) {
    return NextResponse.json({ error: 'domain, topic, and difficulty are required' }, { status: 400 });
  }

  // 1. Generate questions via AI
  let questions;
  try {
    questions = await generateQuestions({
      domain,
      topic,
      subtopic: subtopic || undefined,
      difficulty,
      count,
      role: typeof role === 'string' && role.trim() ? role.trim().slice(0, 120) : undefined,
    });
  } catch (error: any) {
    if (error?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
    }
    if (error?.status === 401) {
      return NextResponse.json({ error: 'AI service authentication failed.' }, { status: 500 });
    }
    console.error('Groq API error:', error);
    return NextResponse.json({ error: 'AI service unavailable.' }, { status: 500 });
  }

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: 'No questions generated. Please try again.' }, { status: 500 });
  }

  // 2. Save to DB
  const userId = (session.user as any).id;
  let sessionId = null;

  if (!userId) {
    console.error('DB save skipped: userId missing from session. User may need to log out and log back in.');
  } else {
    try {
      await connectDB();
      const saved = await QuestionSession.create({
        userId,
        domain,
        topic,
        subtopic: subtopic || '',
        difficulty,
        questions,
      });
      sessionId = saved._id;
      // Non-blocking: activity tracking failure must not fail the save.
      recordActivity(userId).catch((e) =>
        console.error('recordActivity failed (questions):', e?.message || e)
      );
    } catch (error: any) {
      console.error('DB save error:', error?.message || error);
    }
  }

  return NextResponse.json({ sessionId, questions });
}
