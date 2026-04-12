'use client';

import { useEffect, useRef } from 'react';
import { Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConversationMessage } from '@/types';

interface TranscriptDisplayProps {
  messages: ConversationMessage[];
  isProcessing: boolean;
}

export function TranscriptDisplay({ messages, isProcessing }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  if (messages.length === 0 && !isProcessing) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        The conversation will appear here...
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={cn(
            'flex gap-3 max-w-[85%]',
            msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
          )}
        >
          <div className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            msg.role === 'ai' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          )}>
            {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
          </div>
          <div className={cn(
            'rounded-lg px-4 py-2.5 text-sm',
            msg.role === 'ai'
              ? 'bg-card border'
              : 'bg-primary text-primary-foreground'
          )}>
            {msg.content}
          </div>
        </div>
      ))}

      {/* Typing indicator */}
      {isProcessing && (
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-4 w-4" />
          </div>
          <div className="rounded-lg px-4 py-2.5 bg-card border">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
