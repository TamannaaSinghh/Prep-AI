import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import QuestionSession from '@/models/QuestionSession';
import InterviewSession from '@/models/InterviewSession';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    await connectDB();

    const [questionSessions, interviewSessions] = await Promise.all([
      QuestionSession.find({ userId }).select('domain topic subtopic createdAt').lean(),
      InterviewSession.find({ userId }).select('domain topic subtopic totalScore maxScore completedAt').sort({ completedAt: 1 }).lean(),
    ]);

    const topicsCovered = Array.from(new Set(questionSessions.map((s: any) => s.domain)));
    const totalSessions = questionSessions.length;
    const totalInterviews = interviewSessions.length;

    let averageScore = 0;
    if (totalInterviews > 0) {
      const totalPct = interviewSessions.reduce((sum: number, i: any) => {
        return sum + (i.maxScore > 0 ? (i.totalScore / i.maxScore) * 100 : 0);
      }, 0);
      averageScore = totalPct / totalInterviews;
    }

    const scoreHistory = interviewSessions.map((i: any) => ({
      date: new Date(i.completedAt).toISOString().split('T')[0],
      score: i.maxScore > 0 ? Math.round((i.totalScore / i.maxScore) * 100) : 0,
      domain: i.domain,
      topic: i.topic || '',
    }));

    const domainMap: Record<string, number> = {};
    questionSessions.forEach((s: any) => {
      domainMap[s.domain] = (domainMap[s.domain] || 0) + 1;
    });
    const domainBreakdown = Object.entries(domainMap).map(([domain, sessions]) => ({
      domain,
      sessions,
    }));

    return NextResponse.json({
      topicsCovered,
      totalSessions,
      totalInterviews,
      averageScore: Math.round(averageScore * 100) / 100,
      scoreHistory,
      domainBreakdown,
    });
  } catch (error: any) {
    console.error('Progress fetch error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to load progress data. Please try again.' }, { status: 500 });
  }
}
