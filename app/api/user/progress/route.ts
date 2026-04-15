import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import UserProgress from '@/models/UserProgress';
import { getUserProgress, STREAK_MILESTONE } from '@/lib/userProgress';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  if (!userId) return NextResponse.json({ error: 'User session incomplete.' }, { status: 401 });

  try {
    const progress = await getUserProgress(userId);
    return NextResponse.json({
      ...progress,
      streakMilestone: STREAK_MILESTONE,
    });
  } catch (error: any) {
    console.error('User progress fetch error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to load user progress.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  if (!userId) return NextResponse.json({ error: 'User session incomplete.' }, { status: 401 });

  let body: {
    interviewDate?: string | null;
    interviewRole?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    await connectDB();

    const set: Record<string, unknown> = { updatedAt: new Date() };
    const unset: Record<string, 1> = {};

    if ('interviewDate' in body) {
      if (body.interviewDate === null || body.interviewDate === '') {
        unset.interviewDate = 1;
      } else if (body.interviewDate) {
        const d = new Date(body.interviewDate);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json({ error: 'Invalid interview date.' }, { status: 400 });
        }
        set.interviewDate = d;
      }
    }

    if ('interviewRole' in body) {
      const role = body.interviewRole;
      if (role === null || role === '') {
        unset.interviewRole = 1;
      } else if (typeof role === 'string') {
        const trimmed = role.trim().slice(0, 120);
        if (trimmed) {
          set.interviewRole = trimmed;
        } else {
          unset.interviewRole = 1;
        }
      }
    }

    const update: Record<string, unknown> = { $set: set };
    if (Object.keys(unset).length > 0) update.$unset = unset;

    await UserProgress.updateOne(
      { userId },
      update,
      { upsert: true, setDefaultsOnInsert: true }
    );

    const progress = await getUserProgress(userId);
    return NextResponse.json({ ...progress, streakMilestone: STREAK_MILESTONE });
  } catch (error: any) {
    console.error('User progress update error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to update user progress.' }, { status: 500 });
  }
}
