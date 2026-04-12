import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import InterviewSession from '@/models/InterviewSession';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    await connectDB();

    const interviews = await InterviewSession.find({ userId })
      .select('domain topic subtopic totalQuestions totalScore maxScore completedAt durationSeconds')
      .sort({ completedAt: -1 })
      .lean();

    const mapped = interviews.map((i: any) => ({
      _id: i._id.toString(),
      domain: i.domain,
      topic: i.topic || '',
      subtopic: i.subtopic || '',
      totalScore: i.totalScore,
      maxScore: i.maxScore,
      percentage: i.maxScore > 0 ? Math.round((i.totalScore / i.maxScore) * 10000) / 100 : 0,
      totalQuestions: i.totalQuestions,
      completedAt: i.completedAt,
      durationSeconds: i.durationSeconds,
    }));

    return NextResponse.json({ interviews: mapped });
  } catch (error: any) {
    console.error('Interviews fetch error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to load interviews. Please try again.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const userId = (session.user as any).id;

  if (!userId) {
    return NextResponse.json({ error: 'User session incomplete. Please log out and log back in.' }, { status: 401 });
  }

  try {
    await connectDB();

    const saved = await InterviewSession.create({
      userId,
      ...body,
    });

    return NextResponse.json({ id: saved._id.toString() });
  } catch (error: any) {
    console.error('Interview save error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to save interview session.' }, { status: 500 });
  }
}
