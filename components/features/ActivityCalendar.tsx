'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Dot, Flame, CalendarClock } from 'lucide-react';

interface ActivityCalendarProps {
  activityDates: string[];  // ISO YYYY-MM-DD
  interviewDate?: string | Date | null;
  streak: number;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function sameYM(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// Monday = 0, Sunday = 6 (matches WEEKDAYS above).
function weekdayIndex(d: Date): number {
  const js = d.getDay();
  return (js + 6) % 7;
}

/**
 * Monthly heatmap-style activity calendar. Active days are tinted purple; the
 * interview date is marked with a ring. Navigation lets the user move between
 * months. Stays in sync with the Learnify purple theme.
 */
export function ActivityCalendar({
  activityDates,
  interviewDate,
  streak,
}: ActivityCalendarProps) {
  const today = new Date();
  const todayISO = toISO(today);

  const [viewDate, setViewDate] = useState(() => {
    // Default: show the month of the interview date if it's set, else today.
    if (interviewDate) {
      const d = new Date(interviewDate);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return today;
  });

  const interview = useMemo(() => {
    if (!interviewDate) return null;
    const d = new Date(interviewDate);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [interviewDate]);

  const interviewISO = interview ? toISO(interview) : null;
  const activitySet = useMemo(() => new Set(activityDates), [activityDates]);

  // Build the month grid (6 weeks × 7 days to cover overflow).
  const cells = useMemo(() => {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const startOffset = weekdayIndex(first); // days before the 1st
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - startOffset);

    const out: { date: Date; iso: string; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      out.push({ date: d, iso: toISO(d), inMonth: sameYM(d, viewDate) });
    }
    return out;
  }, [viewDate]);

  const monthLabel = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Count active days this month (for the header summary).
  const activeThisMonth = cells.filter(
    (c) => c.inMonth && activitySet.has(c.iso)
  ).length;

  function shiftMonth(delta: number) {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  return (
    <div className="space-y-3 max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="h-7 w-7 rounded-md hover:bg-accent transition-colors flex items-center justify-center"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <p className="text-xs font-semibold min-w-[110px] text-center">
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="h-7 w-7 rounded-md hover:bg-accent transition-colors flex items-center justify-center"
            aria-label="Next month"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewDate(new Date())}
            className="text-[10px] text-primary font-medium hover:underline ml-1"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-sm bg-primary" />
            {activeThisMonth}
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-0.5 text-orange-500 font-medium">
              <Flame className="h-3 w-3" />
              {streak}
            </span>
          )}
        </div>
      </div>

      {/* Weekday row */}
      <div className="grid grid-cols-7 gap-1 text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid — fixed compact cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ date, iso, inMonth }) => {
          const active = activitySet.has(iso);
          const isToday = iso === todayISO;
          const isInterview = iso === interviewISO;

          let cellClass =
            'relative h-8 rounded-md border text-[11px] font-medium flex items-center justify-center transition-all duration-200 ease-soft';

          if (!inMonth) {
            cellClass += ' text-muted-foreground/40 border-transparent';
          } else if (active) {
            cellClass +=
              ' bg-primary text-white border-transparent shadow-pill';
          } else {
            cellClass += ' border-border text-foreground/70 hover:bg-accent/40';
          }

          if (isToday && inMonth && !active) {
            cellClass += ' ring-2 ring-primary/40';
          }
          if (isInterview) {
            cellClass += ' ring-2 ring-amber-500';
          }

          return (
            <div key={iso} className={cellClass} title={iso}>
              {date.getDate()}
              {isToday && inMonth && (
                <Dot className="absolute -bottom-1 h-2.5 w-2.5 text-primary" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground pt-1">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
          Active
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm border-2 border-primary/40" />
          Today
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-2.5 w-2.5 text-amber-500" />
          Interview
        </span>
      </div>
    </div>
  );
}
