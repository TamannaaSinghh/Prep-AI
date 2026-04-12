'use client';

import { useReducer, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DomainSelector } from '@/components/features/DomainSelector';
import { PushToTalkButton } from '@/components/features/PushToTalkButton';
import { TranscriptDisplay } from '@/components/features/TranscriptDisplay';
import { VoiceVisualizer } from '@/components/features/VoiceVisualizer';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Difficulty, ConversationMessage, VoiceEvaluation } from '@/types';
import { AudioLines, Loader2, Play, RotateCcw, Save, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

// ── State machine ────────────────────────────────────────────────────

interface VoiceState {
  status: 'idle' | 'starting' | 'active' | 'evaluating' | 'complete';
  conversation: ConversationMessage[];
  // Groq-format messages for API calls
  aiMessages: any[];
  turnCount: number;
  startedAt: Date | null;
  evaluation: VoiceEvaluation | null;
  isProcessing: boolean;
}

type VoiceAction =
  | { type: 'START_LOADING' }
  | { type: 'STARTED'; aiText: string; aiMessages: any[] }
  | { type: 'PROCESSING' }
  | { type: 'USER_SPOKE'; transcript: string }
  | { type: 'AI_RESPONDED'; aiText: string; aiMessages: any[] }
  | { type: 'EVALUATING' }
  | { type: 'EVALUATED'; evaluation: VoiceEvaluation }
  | { type: 'RESET' };

const initialState: VoiceState = {
  status: 'idle',
  conversation: [],
  aiMessages: [],
  turnCount: 0,
  startedAt: null,
  evaluation: null,
  isProcessing: false,
};

function voiceReducer(state: VoiceState, action: VoiceAction): VoiceState {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, status: 'starting' };
    case 'STARTED':
      return {
        ...state,
        status: 'active',
        startedAt: new Date(),
        aiMessages: action.aiMessages,
        conversation: [
          { role: 'ai', content: action.aiText, timestamp: new Date().toISOString() },
        ],
        turnCount: 0,
      };
    case 'PROCESSING':
      return { ...state, isProcessing: true };
    case 'USER_SPOKE':
      return {
        ...state,
        conversation: [
          ...state.conversation,
          { role: 'user', content: action.transcript, timestamp: new Date().toISOString() },
        ],
        turnCount: state.turnCount + 1,
      };
    case 'AI_RESPONDED':
      return {
        ...state,
        isProcessing: false,
        aiMessages: action.aiMessages,
        conversation: [
          ...state.conversation,
          { role: 'ai', content: action.aiText, timestamp: new Date().toISOString() },
        ],
      };
    case 'EVALUATING':
      return { ...state, status: 'evaluating', isProcessing: false };
    case 'EVALUATED':
      return { ...state, status: 'complete', evaluation: action.evaluation };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// ── Component ────────────────────────────────────────────────────────

export default function VoiceInterviewPage() {
  const [domain, setDomain] = useState('');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [state, dispatch] = useReducer(voiceReducer, initialState);

  const recorder = useAudioRecorder();
  const player = useAudioPlayer();

  const canStart = domain.trim() && topic.trim() && difficulty;

  // ── Handle recorded audio blob ──

  const handleAudioBlob = useCallback(async (blob: Blob) => {
    if (blob.size < 1000) {
      setError('Recording too short. Please speak for at least a few seconds.');
      return;
    }

    dispatch({ type: 'PROCESSING' });
    setError('');

    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');
    formData.append('messages', JSON.stringify(state.aiMessages));

    try {
      const res = await fetch('/api/voice-interview/respond', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to process your response.');
        dispatch({ type: 'AI_RESPONDED', aiText: '', aiMessages: state.aiMessages });
        return;
      }

      const data = await res.json();

      if (data.transcript) {
        dispatch({ type: 'USER_SPOKE', transcript: data.transcript });
      }

      dispatch({ type: 'AI_RESPONDED', aiText: data.aiText, aiMessages: data.messages });

      // Speak AI response
      if (data.aiText) {
        player.speak(data.aiText);
      }

      // Check if interview is complete
      if (data.isComplete) {
        dispatch({ type: 'EVALUATING' });
        triggerEvaluate(data.messages);
      }
    } catch {
      setError('Network error. Please try again.');
      dispatch({ type: 'AI_RESPONDED', aiText: '', aiMessages: state.aiMessages });
    }
  }, [state.aiMessages, player]); // eslint-disable-line react-hooks/exhaustive-deps

  // Watch for new audio blobs from recorder
  useEffect(() => {
    if (recorder.audioBlob && state.status === 'active') {
      handleAudioBlob(recorder.audioBlob);
    }
  }, [recorder.audioBlob]);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Start interview ──

  async function handleStart() {
    if (!canStart) return;
    dispatch({ type: 'START_LOADING' });
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/voice-interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim(), topic: topic.trim(), subtopic: subtopic.trim(), difficulty }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to start interview.');
        dispatch({ type: 'RESET' });
        return;
      }

      const data = await res.json();
      dispatch({ type: 'STARTED', aiText: data.aiText, aiMessages: data.messages });

      // Speak the AI's greeting
      if (data.aiText) {
        player.speak(data.aiText);
      }
    } catch {
      setError('Network error. Please try again.');
      dispatch({ type: 'RESET' });
    }
  }

  // ── Evaluate ──

  const failedEvaluation: VoiceEvaluation = { overallScore: 0, strengths: [], weaknesses: [], topicScores: [], summary: 'Evaluation failed.', recommendation: '' };

  async function triggerEvaluate(messages: any[]) {
    try {
      const res = await fetch('/api/voice-interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, domain: domain.trim(), topic: topic.trim() }),
      });

      if (!res.ok) {
        setError('Failed to evaluate interview.');
        dispatch({ type: 'EVALUATED', evaluation: failedEvaluation });
        return;
      }

      const evaluation = await res.json();
      dispatch({ type: 'EVALUATED', evaluation });
    } catch {
      setError('Network error during evaluation.');
      dispatch({ type: 'EVALUATED', evaluation: failedEvaluation });
    }
  }

  // ── Save session ──

  async function handleSave() {
    const durationSeconds = state.startedAt
      ? Math.round((Date.now() - state.startedAt.getTime()) / 1000)
      : 0;

    try {
      await fetch('/api/voice-interview/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.trim(),
          topic: topic.trim(),
          subtopic: subtopic.trim(),
          difficulty,
          conversationTurns: state.conversation.map((m) => ({
            role: m.role === 'ai' ? 'ai' : 'user',
            content: m.content,
            timestamp: m.timestamp,
          })),
          totalTurns: state.turnCount,
          overallScore: state.evaluation?.overallScore ?? 0,
          evaluation: state.evaluation ?? { strengths: [], weaknesses: [], topicScores: [], summary: '', recommendation: '' },
          durationSeconds,
        }),
      });
      setSaved(true);
    } catch {
      setError('Failed to save session.');
    }
  }

  // ── End interview early ──

  function handleEndEarly() {
    player.stop();
    dispatch({ type: 'EVALUATING' });
    triggerEvaluate(state.aiMessages);
  }

  // ── Elapsed time display ──

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (state.status !== 'active' || !state.startedAt) return;
    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - state.startedAt!.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.status, state.startedAt]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── IDLE ──

  if (state.status === 'idle') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Voice Interview</h1>
          <p className="text-muted-foreground mt-1">
            Have a real-time voice conversation with an AI interviewer
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AudioLines className="h-5 w-5" /> Configure Your Interview
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
              Voice-based interview with cross-questioning and follow-ups
            </div>
            <Button onClick={handleStart} disabled={!canStart} className="gap-2">
              <Play className="h-4 w-4" />
              Start Voice Interview
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {recorder.hasPermission === false && (
              <p className="text-sm text-destructive">
                Microphone access is required. Please allow microphone access in your browser settings and refresh the page.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── STARTING ──

  if (state.status === 'starting') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Preparing your interview...</p>
      </div>
    );
  }

  // ── ACTIVE ──

  if (state.status === 'active') {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-muted-foreground">
            {domain.trim()} — {topic.trim()} · Turn {state.turnCount}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-muted-foreground">{formatTime(elapsed)}</span>
            <Button variant="outline" size="sm" onClick={handleEndEarly} disabled={state.isProcessing}>
              End Interview
            </Button>
          </div>
        </div>

        {/* Transcript */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <TranscriptDisplay
            messages={state.conversation}
            isProcessing={state.isProcessing}
          />
        </Card>

        {/* Voice controls */}
        <div className="py-6">
          <VoiceVisualizer isRecording={recorder.isRecording} isAiSpeaking={player.isPlaying} />
          <PushToTalkButton
            isRecording={recorder.isRecording}
            isProcessing={state.isProcessing}
            isAiSpeaking={player.isPlaying}
            disabled={false}
            onStart={recorder.startRecording}
            onStop={recorder.stopRecording}
          />
          {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>}
          {recorder.error && <p className="text-sm text-destructive text-center mt-2">{recorder.error}</p>}
        </div>
      </div>
    );
  }

  // ── EVALUATING ──

  if (state.status === 'evaluating') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">AI is evaluating your interview...</p>
      </div>
    );
  }

  // ── COMPLETE ──

  if (state.status === 'complete' && state.evaluation) {
    const eval_ = state.evaluation;
    const scoreColor = eval_.overallScore >= 70 ? 'text-green-600' : eval_.overallScore >= 40 ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Score header */}
        <div className="text-center space-y-2">
          <AudioLines className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">Interview Complete!</h1>
          <p className={`text-4xl font-bold ${scoreColor}`}>{eval_.overallScore}/100</p>
          <p className="text-muted-foreground">{state.turnCount} turns · {formatTime(elapsed)}</p>
        </div>

        {/* Summary */}
        {eval_.summary && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm">{eval_.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid gap-4 sm:grid-cols-2">
          {eval_.strengths.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {eval_.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {eval_.weaknesses.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" /> Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {eval_.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {w}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Topic Scores */}
        {eval_.topicScores.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Topic Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {eval_.topicScores.map((ts, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ts.topic}</p>
                    <p className="text-xs text-muted-foreground">{ts.comment}</p>
                  </div>
                  <span className={`text-lg font-bold ${
                    ts.score >= 7 ? 'text-green-600' : ts.score >= 4 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {ts.score}/10
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recommendation */}
        {eval_.recommendation && (
          <Card>
            <CardContent className="pt-6 flex gap-3">
              <Lightbulb className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm">{eval_.recommendation}</p>
            </CardContent>
          </Card>
        )}

        {/* Transcript */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Full Transcript</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {state.conversation.map((msg, i) => (
                <p key={i} className="text-sm">
                  <span className="font-medium">{msg.role === 'ai' ? 'Interviewer' : 'You'}:</span>{' '}
                  <span className="text-muted-foreground">{msg.content}</span>
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          {!saved ? (
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> Save Session
            </Button>
          ) : (
            <Button disabled className="gap-2">
              <CheckCircle className="h-4 w-4" /> Saved
            </Button>
          )}
          <Button variant="outline" onClick={() => dispatch({ type: 'RESET' })} className="gap-2">
            <RotateCcw className="h-4 w-4" /> New Interview
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return null;
}
