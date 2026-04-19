'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays,
  CalendarClock,
  Pencil,
  X,
  Check,
  Loader2,
  Briefcase,
} from 'lucide-react';

interface InterviewCountdownCardProps {
  interviewDate?: string | Date | null;
  interviewRole?: string | null;
  onChange?: (next: {
    interviewDate: string | null;
    interviewRole: string | null;
  }) => void | Promise<void>;
}

const ROLE_SUGGESTIONS = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full-Stack Engineer',
  'Mobile Engineer',
  'Data Engineer',
  'ML Engineer',
  'Data Scientist',
  'DevOps / SRE',
];

function toDateInputValue(d?: string | Date | null): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatNice(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Interview countdown card. Captures BOTH the interview date and the target
 * role in one form. The role propagates to question generation and the doubt
 * chatbot so answers are tuned to what the student is actually interviewing for.
 */
export function InterviewCountdownCard({
  interviewDate,
  interviewRole,
  onChange,
}: InterviewCountdownCardProps) {
  const initialDate = toDateInputValue(interviewDate);
  const initialRole = interviewRole ?? '';

  // Only start in edit mode if neither field is set yet.
  const [editing, setEditing] = useState(!initialDate && !initialRole);
  const [dateValue, setDateValue] = useState(initialDate);
  const [roleValue, setRoleValue] = useState(initialRole);
  const [saving, setSaving] = useState(false);

  const today = toDateInputValue(new Date());
  const dateObj = interviewDate ? new Date(interviewDate) : null;
  const diff = dateObj && !Number.isNaN(dateObj.getTime()) ? daysBetween(dateObj) : null;

  async function save() {
    setSaving(true);
    try {
      await onChange?.({
        interviewDate: dateValue || null,
        interviewRole: roleValue.trim() || null,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function clearAll() {
    setSaving(true);
    try {
      await onChange?.({ interviewDate: null, interviewRole: null });
      setDateValue('');
      setRoleValue('');
      setEditing(true);
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setDateValue(initialDate);
    setRoleValue(initialRole);
    setEditing(false);
  }

  const hasAnything = !!(initialDate || initialRole);

  return (
    <Card className="relative overflow-hidden bg-card border-primary/15">

      <CardContent className="relative p-5">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <CalendarClock className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            {/* ── Display mode ── */}
            {!editing && hasAnything && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Interview day
                  </p>
                  {diff !== null && (
                    diff < 0 ? (
                      <Badge variant="secondary" className="text-[10px]">Past</Badge>
                    ) : diff === 0 ? (
                      <Badge className="text-[10px] bg-green-600 hover:bg-green-600/90">
                        Today
                      </Badge>
                    ) : diff <= 3 ? (
                      <Badge className="text-[10px] bg-red-500 hover:bg-red-500/90">
                        Final stretch
                      </Badge>
                    ) : diff <= 7 ? (
                      <Badge className="text-[10px] bg-amber-500 hover:bg-amber-500/90">
                        This week
                      </Badge>
                    ) : null
                  )}
                </div>

                {dateObj && diff !== null ? (
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl font-bold leading-none">
                      {diff < 0 ? Math.abs(diff) : diff}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {diff < 0
                        ? `day${Math.abs(diff) === 1 ? '' : 's'} ago`
                        : diff === 0
                        ? 'Good luck today!'
                        : `day${diff === 1 ? '' : 's'} to go`}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No date set — add one to see a countdown.
                  </p>
                )}

                <div className="flex flex-col gap-1 text-xs">
                  {dateObj && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatNice(dateObj)}</span>
                    </div>
                  )}
                  {initialRole && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        <span className="text-muted-foreground">for </span>
                        <span className="font-semibold text-foreground">{initialRole}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
                  >
                    <Pencil className="h-3 w-3" /> edit
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    disabled={saving}
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" /> clear
                  </button>
                </div>
              </div>
            )}

            {/* ── Edit / empty mode ── */}
            {(editing || !hasAnything) && (
              <div className="space-y-3.5">
                <div>
                  <p className="text-sm font-semibold">
                    {hasAnything ? 'Update your interview' : 'Set your interview'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pick a date and the role you&apos;re interviewing for — we&apos;ll use
                    both to focus your prep.
                  </p>
                </div>

                {/* Date input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Interview date
                  </label>
                  <Input
                    type="date"
                    value={dateValue}
                    min={today}
                    onChange={(e) => setDateValue(e.target.value)}
                    className="max-w-[200px]"
                    aria-label="Interview date"
                  />
                </div>

                {/* Role input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Target role
                  </label>
                  <Input
                    type="text"
                    value={roleValue}
                    onChange={(e) => setRoleValue(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    maxLength={120}
                    aria-label="Target role"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {ROLE_SUGGESTIONS.map((r) => {
                      const active = roleValue.trim().toLowerCase() === r.toLowerCase();
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRoleValue(r)}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                            active
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card hover:bg-accent hover:border-primary/40 text-muted-foreground hover:text-primary'
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={save}
                    disabled={saving || (!dateValue && !roleValue.trim())}
                    className="gap-1.5"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Save
                  </Button>
                  {hasAnything && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelEdit}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
