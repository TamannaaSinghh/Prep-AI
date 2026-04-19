'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ProgressChart } from '@/components/features/ProgressChart';
import { ScoreLineChart } from '@/components/features/ScoreLineChart';
import { StudentAnalysisChart } from '@/components/features/StudentAnalysisChart';
import { StreakCard } from '@/components/features/StreakCard';
import { InterviewCountdownCard } from '@/components/features/InterviewCountdownCard';
import { ActivityCalendar } from '@/components/features/ActivityCalendar';
import {
  BookOpen,
  FileText,
  AudioLines,
  Target,
  TrendingUp,
  Activity,
  Sparkles,
  BarChart3,
  LineChart,
  LayoutGrid,
  Flame,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';

interface ProgressData {
  topicsCovered: string[];
  totalSessions: number;
  totalInterviews: number;
  totalVoiceInterviews: number;
  averageScore: number;
  scoreHistory: { date: string; score: number; domain?: string; topic?: string }[];
  domainBreakdown: { domain: string; sessions: number }[];
}

interface UserProgressData {
  interviewDate?: string | null;
  interviewRole?: string | null;
  streak: number;
  longestStreak: number;
  activityDates: string[];
  coins: number;
  streakMilestone: number;
}

const STAT_CARDS = [
  {
    key: 'topicsCovered' as const,
    label: 'Topics covered',
    icon: Target,
    color: 'text-primary',
    bg: 'bg-primary/10',
    ring: 'ring-primary/10',
  },
  {
    key: 'totalSessions' as const,
    label: 'Practice sessions',
    icon: BookOpen,
    color: 'text-cyan-600',
    bg: 'bg-cyan-500/10',
    ring: 'ring-cyan-500/10',
  },
  {
    key: 'totalInterviews' as const,
    label: 'Mock interviews',
    icon: FileText,
    color: 'text-pink-600',
    bg: 'bg-pink-500/10',
    ring: 'ring-pink-500/10',
  },
  {
    key: 'totalVoiceInterviews' as const,
    label: 'Voice interviews',
    icon: AudioLines,
    color: 'text-[#7C5BE6]',
    bg: 'bg-[#9F7AEA]/15',
    ring: 'ring-[#9F7AEA]/10',
  },
  {
    key: 'averageScore' as const,
    label: 'Average score',
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-500/10',
    ring: 'ring-green-500/10',
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<ProgressData | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [progRes, userRes] = await Promise.all([
          fetch('/api/progress'),
          fetch('/api/user/progress'),
        ]);
        if (progRes.ok) {
          setData(await progRes.json());
        }
        if (userRes.ok) {
          setUserProgress(await userRes.json());
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function updateInterview(next: {
    interviewDate: string | null;
    interviewRole: string | null;
  }) {
    const res = await fetch('/api/user/progress', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    if (res.ok) {
      setUserProgress(await res.json());
    }
  }

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';

  const getStat = (key: (typeof STAT_CARDS)[number]['key']) => {
    if (!data) return 0;
    if (key === 'topicsCovered') return data.topicsCovered?.length ?? 0;
    if (key === 'averageScore') return data.averageScore ?? 0;
    if (key === 'totalSessions') return data.totalSessions ?? 0;
    if (key === 'totalInterviews') return data.totalInterviews ?? 0;
    if (key === 'totalVoiceInterviews') return data.totalVoiceInterviews ?? 0;
    return 0;
  };

  const hasAnyData =
    !!data &&
    ((data.domainBreakdown?.length ?? 0) > 0 ||
      (data.scoreHistory?.length ?? 0) > 0);

  if (loading) {
    return (
      <div className="space-y-8 max-w-7xl">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* ── Greeting ── */}
      <section>
        <h1 className="text-3xl font-bold">Hey, {firstName}!</h1>
        <p className="text-muted-foreground mt-1">
          Ready to ace your next interview?
        </p>
      </section>

      {/* ── Hero banner ── */}
      <section className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-8 shadow-soft">

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <Badge
              variant="secondary"
              className="gap-1.5 bg-card/70 backdrop-blur text-primary border-primary/20"
            >
              <Activity className="h-3 w-3" />
              Progress dashboard
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Your interview prep, visualized
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Track every practice session, mock score, and domain you&apos;ve
              covered. Spot weak areas before they trip you up.
            </p>
          </div>
          {data && data.averageScore > 0 && (
            <div className="rounded-2xl border bg-card/70 backdrop-blur px-5 py-4 flex items-center gap-3 shadow-soft">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Overall
                </p>
                <p className="text-2xl font-bold leading-tight">
                  {data.averageScore.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Streak + Countdown ── */}
      <section className="grid gap-4 md:grid-cols-2">
        <StreakCard
          streak={userProgress?.streak ?? 0}
          longestStreak={userProgress?.longestStreak ?? 0}
          coins={userProgress?.coins ?? 0}
          milestone={userProgress?.streakMilestone ?? 6}
          variant="full"
        />
        <InterviewCountdownCard
          interviewDate={userProgress?.interviewDate ?? null}
          interviewRole={userProgress?.interviewRole ?? null}
          onChange={updateInterview}
        />
      </section>

      {/* ── Stat cards ── */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {STAT_CARDS.map((s) => {
            const raw = getStat(s.key);
            const display =
              s.key === 'averageScore'
                ? raw
                  ? `${Number(raw).toFixed(1)}%`
                  : '—'
                : raw;
            return (
              <Card
                key={s.key}
                className="group hover:-translate-y-0.5 hover:shadow-soft-md cursor-default"
              >
                <CardContent className="p-5 space-y-3">
                  <div
                    className={`h-11 w-11 rounded-xl ${s.bg} ring-4 ${s.ring} flex items-center justify-center group-hover:scale-105 transition-transform`}
                  >
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {s.label}
                    </p>
                    <p className="text-3xl font-bold mt-1">{display}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Activity calendar ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Activity calendar</h2>
              <p className="text-xs text-muted-foreground">
                Every day you practiced, at a glance
              </p>
            </div>
          </div>
          {userProgress && userProgress.activityDates.length > 0 && (
            <Badge variant="secondary" className="hidden md:inline-flex bg-accent text-primary">
              {userProgress.activityDates.length} active days
            </Badge>
          )}
        </div>

        <Card>
          <CardContent className="p-5 md:p-6">
            <ActivityCalendar
              activityDates={userProgress?.activityDates ?? []}
              interviewDate={userProgress?.interviewDate ?? null}
              streak={userProgress?.streak ?? 0}
            />
          </CardContent>
        </Card>
      </section>

      {/* ── Student analysis ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Student analysis</h2>
              <p className="text-xs text-muted-foreground">
                Practice volume vs. mock score, per domain
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="hidden md:inline-flex bg-accent text-primary">
            AI insight
          </Badge>
        </div>

        <Card>
          <CardContent className="p-5 md:p-6">
            {hasAnyData ? (
              <StudentAnalysisChart
                domainBreakdown={data!.domainBreakdown}
                scoreHistory={data!.scoreHistory}
              />
            ) : (
              <EmptyState
                title="No analysis available yet"
                desc="Finish a few practice sessions and at least one mock interview to unlock your personal domain analysis."
                icon={Sparkles}
              />
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Charts row ── */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Domain coverage */}
        <Card>
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#9F7AEA]/15 flex items-center justify-center">
                  <LayoutGrid className="h-5 w-5 text-[#7C5BE6]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Domain coverage</h3>
                  <p className="text-xs text-muted-foreground">
                    Practice sessions per domain
                  </p>
                </div>
              </div>
              {data && data.domainBreakdown.length > 0 && (
                <Badge variant="secondary" className="bg-accent text-primary">
                  {data.domainBreakdown.length} domains
                </Badge>
              )}
            </div>
            <div className="pt-1">
              {data?.domainBreakdown && data.domainBreakdown.length > 0 ? (
                <ProgressChart data={data.domainBreakdown} />
              ) : (
                <EmptyState
                  title="No coverage yet"
                  desc="Start a practice session to see your domain coverage light up."
                  icon={BarChart3}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score over time */}
        <Card>
          <CardContent className="p-5 md:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Score over time</h3>
                  <p className="text-xs text-muted-foreground">
                    Your mock interview scores
                  </p>
                </div>
              </div>
              {data && data.scoreHistory.length > 0 && (
                <Badge variant="secondary" className="bg-accent text-primary">
                  {data.scoreHistory.length} mocks
                </Badge>
              )}
            </div>
            <div className="pt-1">
              {data?.scoreHistory && data.scoreHistory.length > 0 ? (
                <ScoreLineChart data={data.scoreHistory} />
              ) : (
                <EmptyState
                  title="No scores yet"
                  desc="Take your first mock interview to start plotting your growth."
                  icon={TrendingUp}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Continue learning ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Continue learning</h2>
          <span className="text-xs text-muted-foreground">
            Pick a mode to begin
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Practice */}
          <Link href="/prepare" className="group block">
            <Card className="h-full bg-primary/5 hover:-translate-y-1 hover:shadow-soft-lg hover:border-primary/30">
              <CardContent className="p-6 space-y-4 h-full flex flex-col">
                <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-lg font-semibold">Practice Questions</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Generate AI-powered interview questions for any domain and
                    topic. Untimed, with detailed explanations.
                  </p>
                </div>
                <Button className="gap-2 w-fit">
                  Start practicing{' '}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Mock Interview */}
          <Link href="/mock" className="group block">
            <Card className="h-full bg-pink-500/5 hover:-translate-y-1 hover:shadow-soft-lg hover:border-pink-500/30">
              <CardContent className="p-6 space-y-4 h-full flex flex-col">
                <div className="h-12 w-12 rounded-xl bg-pink-500/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="h-5 w-5 text-pink-600" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-lg font-semibold">Mock Interview</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Take a timed, written mock interview with AI evaluation.
                    Scores, feedback, and model answers for every question.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 w-fit border-pink-500/30 text-pink-600 hover:bg-pink-500/10 hover:text-pink-600"
                >
                  Start interview{' '}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Voice Interview */}
          <Link href="/voice" className="group block">
            <Card className="h-full bg-[#9F7AEA]/10 border-[#9F7AEA]/20 hover:-translate-y-1 hover:shadow-soft-lg hover:border-[#9F7AEA]/40 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <Badge className="text-[10px] uppercase tracking-wider gap-1 bg-[#9F7AEA] hover:bg-[#9F7AEA]/90">
                  <Sparkles className="h-3 w-3" /> New
                </Badge>
              </div>
              <CardContent className="p-6 space-y-4 h-full flex flex-col">
                <div className="h-12 w-12 rounded-xl bg-[#9F7AEA]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AudioLines className="h-5 w-5 text-[#7C5BE6]" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-lg font-semibold">Voice Interview</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Speak with a live AI interviewer. Push-to-talk, real-time
                    transcript, and per-topic scoring on clarity and depth.
                  </p>
                </div>
                <Button className="gap-2 w-fit bg-[#7C5BE6] hover:bg-[#7C5BE6]/90 text-white">
                  Try voice mode{' '}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ── Empty state card ── */
function EmptyState({
  title,
  desc,
  icon: Icon,
}: {
  title: string;
  desc: string;
  icon: typeof BarChart3;
}) {
  return (
    <div className="h-[300px] flex flex-col items-center justify-center gap-3 text-center px-6">
      <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground max-w-xs">{desc}</p>
    </div>
  );
}
