'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkdownContent } from '@/components/features/MarkdownContent';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  RefreshCw,
  Briefcase,
} from 'lucide-react';

interface DoubtChatbotProps {
  context?: {
    domain?: string;
    topic?: string;
    subtopic?: string;
    difficulty?: string;
    role?: string;
  };
}

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const SEED_MESSAGE: ChatMsg = {
  role: 'assistant',
  content:
    "Hey — I'm PrepAI. Ask me anything you don't understand while practicing: a concept, a code snippet, a trade-off, why a question expects a particular answer. I'll keep it short and clear.",
};

export function DoubtChatbot({ context }: DoubtChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([SEED_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) {
      // defer so the transform finishes first
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const next: ChatMsg[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/chat/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Send only user/assistant pairs — server prepends the system prompt.
          messages: next
            .filter((m, i) => !(i === 0 && m === SEED_MESSAGE)) // drop seed
            .map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to get a reply.');
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply ?? '' },
      ]);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function resetChat() {
    setMessages([SEED_MESSAGE]);
    setError('');
    setInput('');
  }

  const hasContext = !!(
    context?.domain ||
    context?.topic ||
    context?.subtopic ||
    context?.role
  );
  const contextLabel = [context?.domain, context?.topic, context?.subtopic]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      {/* ── Floating Action Button ── */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-soft-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
          aria-label="Open doubt chatbot"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring pointer-events-none" />
          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-400 text-[10px] font-bold flex items-center justify-center text-amber-900 shadow-pill">
            <Sparkles className="h-3 w-3" />
          </span>
        </button>
      )}

      {/* ── Chat panel ── */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />

          <aside
            className="fixed z-50 bg-card border shadow-soft-lg flex flex-col
                       inset-x-0 bottom-0 top-20 rounded-t-2xl
                       md:inset-auto md:bottom-6 md:right-6 md:w-[400px] md:h-[600px] md:rounded-2xl"
            role="dialog"
            aria-label="Doubt chatbot"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-card rounded-t-2xl">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-pill shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-none">
                    Ask PrepAI
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {hasContext ? `On: ${contextLabel}` : 'Your doubt assistant'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={resetChat}
                  className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Reset conversation"
                  title="New chat"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close chatbot"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Context pills — topic breadcrumb + role chip */}
            {(context?.role || (contextLabel && contextLabel.length > 30)) && (
              <div className="px-4 py-2 border-b bg-muted/30 flex flex-wrap items-center gap-1.5">
                {contextLabel && contextLabel.length > 30 && (
                  <Badge
                    variant="secondary"
                    className="bg-accent text-primary text-[10px]"
                    title={contextLabel}
                  >
                    <span className="truncate max-w-[220px]">{contextLabel}</span>
                  </Badge>
                )}
                {context?.role && (
                  <Badge
                    variant="secondary"
                    className="bg-card border-primary/30 text-primary text-[10px] gap-1"
                    title={`Targeting ${context.role}`}
                  >
                    <Briefcase className="h-3 w-3" />
                    {context.role}
                  </Badge>
                )}
              </div>
            )}

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            >
              {messages.map((m, i) =>
                m.role === 'user' ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3.5 py-2 text-sm leading-relaxed">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-pill">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-accent/50 border px-3.5 py-2.5">
                      <MarkdownContent content={m.content} className="text-sm" />
                    </div>
                  </div>
                )
              )}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-pill">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-accent/50 border px-4 py-3 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-card">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your doubt… (Enter to send, Shift+Enter for a new line)"
                  disabled={loading}
                  rows={2}
                  className="w-full resize-none rounded-xl border bg-background px-3.5 py-2.5 pr-12 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:opacity-60"
                />
                <Button
                  size="icon"
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 bottom-2 h-8 w-8 shrink-0"
                  aria-label="Send message"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                PrepAI can make mistakes — double-check important answers.
              </p>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
