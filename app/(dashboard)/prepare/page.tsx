'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DomainSelector } from '@/components/features/DomainSelector';
import { QuestionCard } from '@/components/features/QuestionCard';
import {
  YouTubeRecommendation,
  YouTubeVideoData,
} from '@/components/features/YouTubeRecommendation';
import { DoubtChatbot } from '@/components/features/DoubtChatbot';
import { Skeleton } from '@/components/ui/skeleton';
import { Difficulty, Question } from '@/types';
import { Loader2, Sparkles, Briefcase } from 'lucide-react';

export default function PreparePage() {
  const [domain, setDomain] = useState('');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [videos, setVideos] = useState<YouTubeVideoData[]>([]);
  const [videoLoading, setVideoLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  // Target role (from dashboard) is auto-pulled so question gen + chatbot
  // can tune to what the student is interviewing for.
  const [interviewRole, setInterviewRole] = useState<string | null>(null);

  const canGenerate = domain.trim() && topic.trim() && difficulty;

  // Store the last used params so "Load More" works even if selectors change
  const [lastParams, setLastParams] = useState<{
    domain: string;
    topic: string;
    subtopic?: string;
    difficulty: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    async function fetchRole() {
      try {
        const res = await fetch('/api/user/progress');
        if (res.ok) {
          const data = await res.json();
          setInterviewRole(data.interviewRole ?? null);
        }
      } catch {
        // Silent — role is optional context.
      }
    }
    fetchRole();
  }, []);

  async function fetchTopVideos(params: {
    domain: string;
    topic: string;
    subtopic?: string;
  }) {
    setVideoLoading(true);
    setVideos([]);
    try {
      const url = new URL('/api/youtube/search', window.location.origin);
      url.searchParams.set('domain', params.domain);
      url.searchParams.set('topic', params.topic);
      if (params.subtopic) url.searchParams.set('subtopic', params.subtopic);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setVideos(Array.isArray(data.videos) ? data.videos : []);
      }
      // Silent fail — videos are a bonus, not critical.
    } catch {
      // ignore
    } finally {
      setVideoLoading(false);
    }
  }

  async function handleGenerate() {
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    setQuestions([]);
    const params = {
      domain: domain.trim(),
      topic: topic.trim(),
      subtopic: subtopic.trim() || undefined,
      difficulty,
      role: interviewRole || undefined,
    };
    setLastParams(params);

    // Kick off the YouTube fetch in parallel — it never blocks question gen.
    fetchTopVideos({ domain: params.domain, topic: params.topic, subtopic: params.subtopic });

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, count: 10 }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to generate questions.');
        return;
      }

      const data = await res.json();
      setQuestions(data.questions ?? []);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    if (!lastParams) return;
    setLoadingMore(true);
    setError('');

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lastParams, count: 10 }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to generate more questions.');
        return;
      }

      const data = await res.json();
      const newQuestions = data.questions ?? [];
      setQuestions(prev => [...prev, ...newQuestions]);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleBookmark(question: Question) {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          explanation: question.explanation,
          domain: domain.trim(),
          topic: topic.trim(),
        }),
      });

      if (res.ok) {
        setQuestions(prev =>
          prev.map(q =>
            q.question === question.question ? { ...q, bookmarked: true } : q
          )
        );
      }
    } catch {
      // Silently fail
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Practice Questions</h1>
        <p className="text-muted-foreground mt-1">
          Generate AI-powered interview questions tailored to your needs
        </p>
        {interviewRole && (
          <div className="mt-3">
            <Badge
              variant="secondary"
              className="gap-1.5 bg-accent text-primary border-primary/20"
            >
              <Briefcase className="h-3 w-3" />
              Targeting&nbsp;
              <span className="font-semibold">{interviewRole}</span>
            </Badge>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Topic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DomainSelector
            domain={domain}
            topic={topic}
            subtopic={subtopic}
            difficulty={difficulty}
            onDomainChange={setDomain}
            onTopicChange={setTopic}
            onSubtopicChange={setSubtopic}
            onDifficultyChange={setDifficulty}
          />
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? 'Generating...' : 'Generate Questions'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(videoLoading || videos.length > 0) && (
        <YouTubeRecommendation videos={videos} loading={videoLoading} />
      )}

      {!loading && questions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Generated {questions.length} Questions
          </h2>
          {questions.map((q, i) => (
            <QuestionCard
              key={i}
              question={q}
              index={i}
              onBookmark={handleBookmark}
            />
          ))}
          {loadingMore && (
            <div className="space-y-4 mb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6 space-y-3">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-center pt-2 pb-4">
            <Button
              onClick={handleLoadMore}
              disabled={loadingMore}
              variant="outline"
              className="gap-2"
            >
              {loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loadingMore ? 'Generating more...' : 'Load 10 More Questions'}
            </Button>
          </div>
        </div>
      )}

      {/* Floating doubt chatbot — context-aware based on current selectors + target role */}
      <DoubtChatbot
        context={{
          domain: domain.trim() || undefined,
          topic: topic.trim() || undefined,
          subtopic: subtopic.trim() || undefined,
          difficulty,
          role: interviewRole ?? undefined,
        }}
      />
    </div>
  );
}
