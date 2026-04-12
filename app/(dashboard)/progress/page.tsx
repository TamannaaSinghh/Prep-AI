'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgressChart } from '@/components/features/ProgressChart';
import { ScoreLineChart } from '@/components/features/ScoreLineChart';
import { BookOpen, Mic, Target, TrendingUp } from 'lucide-react';

interface ProgressData {
  topicsCovered: string[];
  totalSessions: number;
  totalInterviews: number;
  averageScore: number;
  scoreHistory: { date: string; score: number }[];
  domainBreakdown: { domain: string; sessions: number }[];
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await fetch('/api/progress');
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Progress Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your interview preparation journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics Covered</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.topicsCovered.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Practice Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalSessions ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mock Interviews</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalInterviews ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.averageScore ? `${data.averageScore.toFixed(1)}%` : '—'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Domain Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.domainBreakdown && data.domainBreakdown.length > 0 ? (
              <ProgressChart data={data.domainBreakdown} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data yet. Start practicing to see your coverage!
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.scoreHistory && data.scoreHistory.length > 0 ? (
              <ScoreLineChart data={data.scoreHistory} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No interview scores yet. Take a mock interview!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
