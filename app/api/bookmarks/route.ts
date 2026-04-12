import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    await connectDB();
    const bookmarks = await Bookmark.find({ userId }).sort({ savedAt: -1 }).lean();

    const mapped = bookmarks.map((b: any) => ({
      _id: b._id.toString(),
      question: b.question,
      explanation: b.explanation,
      domain: b.domain,
      topic: b.topic,
      savedAt: b.savedAt,
    }));

    return NextResponse.json({ bookmarks: mapped });
  } catch (error: any) {
    console.error('Bookmarks fetch error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to load bookmarks. Please try again.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const { question, explanation, domain, topic } = await req.json();

  if (!question || !explanation || !domain || !topic) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  try {
    await connectDB();

    const bookmark = await Bookmark.create({ userId, question, explanation, domain, topic });
    return NextResponse.json({ id: bookmark._id.toString() });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'Already bookmarked' }, { status: 409 });
    }
    console.error('Bookmark save error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to save bookmark. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 });
  }

  try {
    await connectDB();
    await Bookmark.deleteOne({ _id: id, userId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Bookmark delete error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to delete bookmark.' }, { status: 500 });
  }
}
