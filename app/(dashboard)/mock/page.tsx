'use client';

import { useState, useReducer, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { DomainSelector } from '@/components/features/DomainSelector';
import { MockTimer } from '@/components/features/MockTimer';
import { FeedbackPanel } from '@/components/features/FeedbackPanel';
import { Difficulty, EvaluationResult } from '@/types';
import { Loader2, Mic, Play, SkipForward, Trophy } from 'lucide-react';

interface MockState {
  status: 'idle' | 'active' | 'evaluating' | 'reviewing' | 'complete';
  questions: string[];
  currentIndex: number;
  answers: string[];
  evaluations: EvaluationResult[];
  startedAt: Date | null;
}

type MockAction =
  | { type: 'START'; questions: string[] }
  | { type: 'ANSWER'; answer: string }
  | { type: 'EVALUATED'; result: EvaluationResult }
  | { type: 'NEXT' }
  | { type: 'COMPLETE' }
  | { type: 'RESET' };

function mockReducer(state: MockState, action: MockAction): MockState {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'active', questions: action.questions, startedAt: new Date() };
    case 'ANSWER':
      return { ...state, status: 'evaluating', answers: [...state.answers, action.answer] };
    case 'EVALUATED':
      return { ...state, status: 'reviewing', evaluations: [...state.evaluations, action.result] };
    case 'NEXT': {
      const nextIndex = state.currentIndex + 1;
      return nextIndex >= state.questions.length
        ? { ...state, status: 'complete' }
        : { ...state, status: 'active', currentIndex: nextIndex };
    }
    case 'COMPLETE':
      return { ...state, status: 'complete' };
    case 'RESET':
      return { status: 'idle', questions: [], currentIndex: 0, answers: [], evaluations: [], startedAt: null };
    default:
      return state;
  }
}

const TIMER_SECONDS = 180; // 3 minutes per question

export default function MockPage() {
  const [domain, setDomain] = useState('');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [state, dispatch] = useReducer(mockReducer, {
    status: 'idle',
    questions: [],
    currentIndex: 0,
    answers: [],
    evaluations: [],
    startedAt: null,
  });

  const canStart = domain.trim() && topic.trim() && difficulty;

  async function handleStart() {
    if (!canStart) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.trim(),
          topic: topic.trim(),
          subtopic: subtopic.trim() || undefined,
          difficulty,
          count: 5,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to generate questions.');
        return;
      }

      const data = await res.json();
      const questionTexts = (data.questions ?? []).map((q: any) => q.question);
      if (questionTexts.length === 0) {
        setError('No questions generated. Please try again.');
        return;
      }
      dispatch({ type: 'START', questions: questionTexts });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    const answer = currentAnswer.trim();
    if (!answer) return;

    dispatch({ type: 'ANSWER', answer });
    setCurrentAnswer('');

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: state.questions[state.currentIndex],
          userAnswer: answer,
          domain: domain.trim(),
        }),
      });

      if (!res.ok) {
        dispatch({
          type: 'EVALUATED',
          result: { score: 0, strengths: [], gaps: ['Evaluation failed'], feedback: 'Please try again.', modelAnswer: '' },
        });
        return;
      }

      const result = await res.json();
      dispatch({ type: 'EVALUATED', result });
    } catch {
      dispatch({
        type: 'EVALUATED',
        result: { score: 0, strengths: [], gaps: ['Network error'], feedback: 'Please try again.', modelAnswer: '' },
      });
    }
  }

  const handleTimerExpire = useCallback(() => {
    if (state.status === 'active') {
      const answer = currentAnswer.trim() || '(No answer provided - time expired)';
      dispatch({ type: 'ANSWER', answer });
      setCurrentAnswer('');

      fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: state.questions[state.currentIndex],
          userAnswer: answer,
          domain: domain.trim(),
        }),
      })
        .then(res => res.json())
        .then(result => dispatch({ type: 'EVALUATED', result }))
        .catch(() =>
          dispatch({
            type: 'EVALUATED',
            result: { score: 0, strengths: [], gaps: ['Time expired'], feedback: 'Time ran out.', modelAnswer: '' },
          })
        );
    }
  }, [state.status, state.questions, state.currentIndex, currentAnswer, domain]);

  async function handleSaveSession() {
    const totalScore = state.evaluations.reduce((s, e) => s + e.score, 0);
    const durationSeconds = state.startedAt
      ? Math.round((Date.now() - state.startedAt.getTime()) / 1000)
      : 0;

    try {
      await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.trim(),
          topic: topic.trim(),
          subtopic: subtopic.trim() || '',
          totalQuestions: state.questions.length,
          totalScore,
          maxScore: state.questions.length * 10,
          answers: state.questions.map((q, i) => ({
            question: q,
            userAnswer: state.answers[i] ?? '',
            score: state.evaluations[i]?.score ?? 0,
            feedback: state.evaluations[i]?.feedback ?? '',
            modelAnswer: state.evaluations[i]?.modelAnswer ?? '',
            timeTaken: TIMER_SECONDS,
          })),
          durationSeconds,
        }),
      });
    } catch {
      // Silently fail
    }
  }

  // IDLE — Setup screen
  if (state.status === 'idle') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mock Interview</h1>
          <p className="text-muted-foreground mt-1">
            Timed interview with AI evaluation and feedback
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" /> Configure Your Interview
            </CardTitle>
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
            <div className="text-sm text-muted-foreground">
              5 questions · {TIMER_SECONDS / 60} minutes per question
            </div>
            <Button onClick={handleStart} disabled={!canStart || loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {loading ? 'Preparing...' : 'Start Interview'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ACTIVE — Answer question
  if (state.status === 'active') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Question {state.currentIndex + 1} of {state.questions.length}
          </span>
          <MockTimer
            durationSeconds={TIMER_SECONDS}
            onExpire={handleTimerExpire}
            isActive={true}
            key={state.currentIndex}
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-lg font-medium mb-6">{state.questions[state.currentIndex]}</p>
            <Textarea
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()} className="gap-2">
                Submit Answer
              </Button>
              <Button variant="outline" onClick={handleTimerExpire} className="gap-2">
                <SkipForward className="h-4 w-4" /> Skip
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // EVALUATING
  if (state.status === 'evaluating') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">AI is evaluating your answer...</p>
      </div>
    );
  }

  // REVIEWING — Show feedback for last answer
  if (state.status === 'reviewing') {
    const lastEval = state.evaluations[state.evaluations.length - 1];
    const isLast = state.currentIndex >= state.questions.length - 1;

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-sm text-muted-foreground">
          Question {state.currentIndex + 1} of {state.questions.length} — Review
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-lg font-medium mb-2">{state.questions[state.currentIndex]}</p>
            <p className="text-sm text-muted-foreground mb-4">
              <strong>Your answer:</strong> {state.answers[state.answers.length - 1]}
            </p>
          </CardContent>
        </Card>

        {lastEval && <FeedbackPanel result={lastEval} />}

        <Button
          onClick={() => {
            if (isLast) {
              dispatch({ type: 'COMPLETE' });
              handleSaveSession();
            } else {
              dispatch({ type: 'NEXT' });
            }
          }}
          className="gap-2"
        >
          {isLast ? (
            <>
              <Trophy className="h-4 w-4" /> View Results
            </>
          ) : (
            <>
              Next Question <SkipForward className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    );
  }

  // COMPLETE — Summary
  if (state.status === 'complete') {
    const totalScore = state.evaluations.reduce((s, e) => s + e.score, 0);
    const maxScore = state.questions.length * 10;
    const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <Trophy className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">Interview Complete!</h1>
          <p className="text-xl text-muted-foreground">
            You scored <span className="font-bold text-foreground">{totalScore}/{maxScore}</span> ({pct}%)
          </p>
        </div>

        <div className="space-y-4">
          {state.questions.map((q, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm text-muted-foreground">Q{i + 1}</p>
                  <span className={`text-lg font-bold ${
                    (state.evaluations[i]?.score ?? 0) >= 7 ? 'text-green-600' :
                    (state.evaluations[i]?.score ?? 0) >= 4 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {state.evaluations[i]?.score ?? 0}/10
                  </span>
                </div>
                <p className="font-medium mb-2">{q}</p>
                <p className="text-sm text-muted-foreground">{state.evaluations[i]?.feedback}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={() => dispatch({ type: 'RESET' })} className="gap-2">
            <Play className="h-4 w-4" /> New Interview
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
