'use client';

import { useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PushToTalkButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  isAiSpeaking: boolean;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function PushToTalkButton({
  isRecording,
  isProcessing,
  isAiSpeaking,
  disabled,
  onStart,
  onStop,
}: PushToTalkButtonProps) {
  const canInteract = !isProcessing && !isAiSpeaking && !disabled;

  const handleClick = useCallback(() => {
    if (!canInteract && !isRecording) return;
    if (isRecording) {
      onStop();
    } else {
      onStart();
    }
  }, [canInteract, isRecording, onStart, onStop]);

  // Spacebar shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        handleClick();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClick]);

  const getIcon = () => {
    if (isProcessing) return <Loader2 className="h-8 w-8 animate-spin" />;
    if (isAiSpeaking) return <Volume2 className="h-8 w-8 animate-pulse" />;
    if (isRecording) return <MicOff className="h-8 w-8" />;
    return <Mic className="h-8 w-8" />;
  };

  const getLabel = () => {
    if (isProcessing) return 'Processing...';
    if (isAiSpeaking) return 'AI is speaking...';
    if (isRecording) return 'Click to stop';
    return 'Click to speak';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing || isAiSpeaking}
        className={cn(
          'relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-4',
          isRecording
            ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300'
            : isProcessing
              ? 'bg-muted text-muted-foreground cursor-wait'
              : isAiSpeaking
                ? 'bg-primary/20 text-primary cursor-default'
                : canInteract
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/30'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
        )}
      >
        {/* Pulsing ring when recording */}
        {isRecording && (
          <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-25" />
        )}
        {getIcon()}
      </button>
      <span className="text-sm text-muted-foreground">{getLabel()}</span>
      {!isProcessing && !isAiSpeaking && !isRecording && canInteract && (
        <span className="text-xs text-muted-foreground">or press spacebar</span>
      )}
    </div>
  );
}
