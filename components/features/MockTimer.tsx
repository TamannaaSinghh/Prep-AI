'use client';
import { useEffect, useState, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';

interface MockTimerProps {
  durationSeconds: number;
  onExpire: () => void;
  isActive: boolean;
}

export function MockTimer({ durationSeconds, onExpire, isActive }: MockTimerProps) {
  const [remaining, setRemaining] = useState(durationSeconds);

  const handleExpire = useCallback(onExpire, [onExpire]);

  useEffect(() => {
    setRemaining(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (!isActive) return;
    if (remaining <= 0) { handleExpire(); return; }

    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { handleExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, remaining, handleExpire]);

  const pct = (remaining / durationSeconds) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isWarning = pct < 25;

  return (
    <div className="flex items-center gap-3">
      <span className={`font-mono text-lg font-bold ${isWarning ? 'text-red-500' : 'text-foreground'}`}>
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
      <Progress value={pct} className={`w-32 ${isWarning ? '[&>div]:bg-red-500' : ''}`} />
    </div>
  );
}
