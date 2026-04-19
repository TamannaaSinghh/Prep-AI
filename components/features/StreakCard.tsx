'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Coins, Trophy } from 'lucide-react';

interface StreakCardProps {
  streak: number;
  longestStreak: number;
  coins: number;
  milestone: number; // e.g. 6
  variant?: 'compact' | 'full';
}

/**
 * Streak + coins card. Renders a ring progress towards the next coin milestone
 * and the lifetime coin count. `compact` is one-line for the dashboard;
 * `full` is a richer layout for the progress page.
 */
export function StreakCard({
  streak,
  longestStreak,
  coins,
  milestone,
  variant = 'compact',
}: StreakCardProps) {
  // Progress towards the next coin.
  const daysInCurrentMilestone = streak % milestone;
  const daysToNextCoin =
    streak === 0 ? milestone : milestone - daysInCurrentMilestone || milestone;
  const ringPct =
    streak === 0 ? 0 : (daysInCurrentMilestone === 0 ? 100 : (daysInCurrentMilestone / milestone) * 100);

  const ringSize = variant === 'full' ? 112 : 84;
  const strokeW = variant === 'full' ? 9 : 7;
  const radius = (ringSize - strokeW) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (ringPct / 100) * circ;

  return (
    <Card className="overflow-hidden">
      <CardContent className={variant === 'full' ? 'p-6' : 'p-5'}>
        <div className="flex items-center gap-5">
          {/* Progress ring with flame */}
          <div
            className="relative shrink-0"
            style={{ width: ringSize, height: ringSize }}
          >
            <svg
              width={ringSize}
              height={ringSize}
              className="-rotate-90"
              aria-hidden="true"
            >
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke="hsl(var(--muted))"
                strokeWidth={strokeW}
                fill="transparent"
              />
              <circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke="url(#streakGradient)"
                strokeWidth={strokeW}
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              <defs>
                <linearGradient id="streakGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#6C4CF1" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame
                className={`${variant === 'full' ? 'h-6 w-6' : 'h-5 w-5'} text-orange-500 ${streak > 0 ? 'drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]' : ''}`}
              />
              <span className={`${variant === 'full' ? 'text-xl' : 'text-lg'} font-bold leading-none mt-0.5`}>
                {streak}
              </span>
            </div>
          </div>

          {/* Streak copy */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold">
                {streak === 0
                  ? 'Start your streak'
                  : streak === 1
                  ? '1 day streak'
                  : `${streak} day streak`}
              </h3>
              {longestStreak > 0 && longestStreak > streak && (
                <Badge variant="secondary" className="text-[10px] gap-1 bg-muted">
                  <Trophy className="h-3 w-3 text-amber-500" /> best {longestStreak}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {streak === 0 ? (
                <>Do any session today to light up your streak.</>
              ) : (
                <>
                  {daysToNextCoin === 0 || daysInCurrentMilestone === 0 ? (
                    <>Coin earned! Keep going to score the next one.</>
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">{daysToNextCoin}</span>{' '}
                      {daysToNextCoin === 1 ? 'day' : 'days'} to your next{' '}
                      <span className="inline-flex items-center gap-0.5 font-semibold text-amber-600">
                        <Coins className="h-3 w-3" /> coin
                      </span>
                      .
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Coin chip */}
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div className="relative h-11 w-11 rounded-2xl bg-amber-500 flex items-center justify-center shadow-pill">
              <Coins className="h-5 w-5 text-white" />
              {coins > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
                  {coins}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              coins
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
