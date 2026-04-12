'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, ChevronDown, ChevronUp, BookmarkX } from 'lucide-react';

interface BookmarkItem {
  _id: string;
  question: string;
  explanation: string;
  domain: string;
  topic: string;
  savedAt: string;
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const res = await fetch('/api/bookmarks');
        if (res.ok) {
          const data = await res.json();
          setBookmarks(data.bookmarks);
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarks();
  }, []);

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/bookmarks?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookmarks(prev => prev.filter(b => b._id !== id));
      }
    } catch {
      // Failed to delete
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookmarks</h1>
        <p className="text-muted-foreground mt-1">Questions you saved for later review</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <BookmarkX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bookmarks yet. Save questions while practicing!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((b) => (
            <Card key={b._id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{b.question}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{b.domain}</Badge>
                      <Badge variant="outline">{b.topic}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(b._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="mt-3 text-sm"
                  onClick={() => setExpandedId(expandedId === b._id ? null : b._id)}
                >
                  {expandedId === b._id ? (
                    <ChevronUp className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-2" />
                  )}
                  {expandedId === b._id ? 'Hide explanation' : 'Show explanation'}
                </Button>

                {expandedId === b._id && (
                  <div className="mt-3 p-4 bg-muted rounded-lg text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {b.explanation}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
