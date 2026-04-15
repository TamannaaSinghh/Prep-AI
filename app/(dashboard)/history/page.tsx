'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { QuestionSessionSummary, InterviewSessionSummary, VoiceInterviewSessionSummary } from '@/types';
import { BookOpen, FileText, AudioLines, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
  const [questionSessions, setQuestionSessions] = useState<QuestionSessionSummary[]>([]);
  const [interviews, setInterviews] = useState<InterviewSessionSummary[]>([]);
  const [voiceSessions, setVoiceSessions] = useState<VoiceInterviewSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [sessRes, intRes, voiceRes] = await Promise.all([
          fetch(`/api/sessions?page=${page}&limit=${limit}`),
          fetch('/api/interviews'),
          fetch('/api/voice-interview/save'),
        ]);

        if (sessRes.ok) {
          const data = await sessRes.json();
          setQuestionSessions(data.sessions);
          setTotal(data.total);
        }
        if (intRes.ok) {
          const data = await intRes.json();
          setInterviews(data.interviews);
        }
        if (voiceRes.ok) {
          const data = await voiceRes.json();
          setVoiceSessions(data.sessions ?? []);
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  const skeletonCards = Array.from({ length: 3 }).map((_, i) => (
    <Card key={i}>
      <CardContent className="pt-6">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  ));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Session History</h1>
        <p className="text-muted-foreground mt-1">Review your past practice and interview sessions</p>
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions" className="gap-2">
            <BookOpen className="h-4 w-4" /> Practice Sessions
          </TabsTrigger>
          <TabsTrigger value="interviews" className="gap-2">
            <FileText className="h-4 w-4" /> Mock Interviews
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <AudioLines className="h-4 w-4" /> Voice Interviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4 mt-4">
          {loading ? skeletonCards : questionSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                No practice sessions yet. Start by generating some questions!
              </CardContent>
            </Card>
          ) : (
            <>
              {questionSessions.map((s) => (
                <Card key={s._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {s.domain} — {s.topic}{s.subtopic ? ` — ${s.subtopic}` : ''}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {s.count} questions · {formatDate(s.createdAt)}
                        </p>
                      </div>
                      <Badge variant="secondary">{s.difficulty}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4 mt-4">
          {loading ? skeletonCards : interviews.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                No mock interviews yet. Take your first mock interview!
              </CardContent>
            </Card>
          ) : (
            interviews.map((i) => (
              <Card key={i._id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {i.domain}{i.topic ? ` — ${i.topic}` : ''}{i.subtopic ? ` — ${i.subtopic}` : ''}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{i.totalQuestions} questions</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(i.durationSeconds)}
                        </span>
                        <span>{formatDate(i.completedAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        i.percentage >= 70 ? 'text-green-600' :
                        i.percentage >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {i.percentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i.totalScore}/{i.maxScore}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="voice" className="space-y-4 mt-4">
          {loading ? skeletonCards : voiceSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                No voice interviews yet. Try the voice interview feature!
              </CardContent>
            </Card>
          ) : (
            voiceSessions.map((v) => (
              <Card key={v._id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {v.domain} — {v.topic}{v.subtopic ? ` — ${v.subtopic}` : ''}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{v.totalTurns} turns</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(v.durationSeconds)}
                        </span>
                        <span>{formatDate(v.completedAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        v.overallScore >= 70 ? 'text-green-600' :
                        v.overallScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {v.overallScore}/100
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
