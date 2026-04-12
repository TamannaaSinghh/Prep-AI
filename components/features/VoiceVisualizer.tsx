'use client';

import { Mic, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceVisualizerProps {
  isRecording: boolean;
  isAiSpeaking: boolean;
}

export function VoiceVisualizer({ isRecording, isAiSpeaking }: VoiceVisualizerProps) {
  if (!isRecording && !isAiSpeaking) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {isRecording && (
        <>
          <Mic className="h-4 w-4 text-red-500" />
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1 rounded-full bg-red-500',
                  'animate-pulse'
                )}
                style={{
                  height: `${12 + Math.random() * 16}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${0.4 + Math.random() * 0.4}s`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-red-500 font-medium">Recording</span>
        </>
      )}
      {isAiSpeaking && (
        <>
          <Volume2 className="h-4 w-4 text-primary animate-pulse" />
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-primary animate-pulse"
                style={{
                  height: `${10 + Math.random() * 14}px`,
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: `${0.5 + Math.random() * 0.3}s`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-primary font-medium">AI Speaking</span>
        </>
      )}
    </div>
  );
}
