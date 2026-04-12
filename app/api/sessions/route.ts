import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import QuestionSession from '@/models/QuestionSession';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '10');
  const skip = (page - 1) * limit;

  try {
    await connectDB();

    const [sessions, total] = await Promise.all([
      QuestionSession.find({ userId })
        .select('domain topic subtopic difficulty questions createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      QuestionSession.countDocuments({ userId }),
    ]);

    const mapped = sessions.map((s: any) => ({
      _id: s._id.toString(),
      domain: s.domain,
      topic: s.topic || '',
      subtopic: s.subtopic || '',
      difficulty: s.difficulty,
      count: s.questions?.length ?? 0,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({ sessions: mapped, total, page });
  } catch (error: any) {
    console.error('Sessions fetch error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to load sessions. Please try again.' }, { status: 500 });
  }
}
