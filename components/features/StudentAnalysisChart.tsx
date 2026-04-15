'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

interface ScoreEntry {
  date: string;
  score: number;
  domain?: string;
  topic?: string;
}

interface DomainEntry {
  domain: string;
  sessions: number;
}

interface StudentAnalysisChartProps {
  domainBreakdown: DomainEntry[];
  scoreHistory: ScoreEntry[];
}

const PRIMARY = '#6C4CF1';
const PRIMARY_LIGHT = '#9F7AEA';
const SCORE_LINE = '#10B981';

function shortDomain(d: string) {
  if (d.length <= 14) return d;
  return d.slice(0, 12) + '…';
}

function classifyMastery(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Strong', color: '#10B981' };
  if (score >= 60) return { label: 'Solid', color: PRIMARY };
  if (score >= 40) return { label: 'Growing', color: '#F59E0B' };
  return { label: 'Focus area', color: '#EF4444' };
}

export function StudentAnalysisChart({
  domainBreakdown,
  scoreHistory,
}: StudentAnalysisChartProps) {
  // Build per-domain stats: sessions + average mock score.
  const scoreByDomain = new Map<string, number[]>();
  scoreHistory.forEach((s) => {
    if (!s.domain) return;
    const list = scoreByDomain.get(s.domain) ?? [];
    list.push(s.score);
    scoreByDomain.set(s.domain, list);
  });

  // Merge domains from both sources so nothing is missed.
  const allDomains = new Set<string>();
  domainBreakdown.forEach((d) => allDomains.add(d.domain));
  scoreByDomain.forEach((_v, k) => allDomains.add(k));

  const sessionsMap = new Map(domainBreakdown.map((d) => [d.domain, d.sessions]));

  const data = Array.from(allDomains).map((domain) => {
    const scores = scoreByDomain.get(domain) ?? [];
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    return {
      domain,
      short: shortDomain(domain),
      sessions: sessionsMap.get(domain) ?? 0,
      avgScore: avg,
      mocks: scores.length,
    };
  });

  if (data.length === 0) return null;

  // Sort so strongest domains show first — makes the narrative obvious.
  data.sort((a, b) => b.avgScore - a.avgScore || b.sessions - a.sessions);

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={340}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
          barCategoryGap="28%"
        >
          <defs>
            <linearGradient id="sessionsBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.95} />
              <stop offset="100%" stopColor={PRIMARY_LIGHT} stopOpacity={0.55} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 4" vertical={false} />
          <XAxis
            dataKey="short"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            dy={6}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            width={40}
            label={{
              value: 'Sessions',
              angle: -90,
              position: 'insideLeft',
              fill: '#9CA3AF',
              fontSize: 10,
              dx: 18,
              dy: 30,
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            tickLine={false}
            axisLine={false}
            width={42}
            tickFormatter={(v) => `${v}%`}
          />

          <Tooltip
            cursor={{ fill: PRIMARY, fillOpacity: 0.06 }}
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              padding: '10px 12px',
              fontSize: 12,
            }}
            labelStyle={{ color: '#1F2937', fontWeight: 600, marginBottom: 4 }}
            formatter={(value, name) => {
              if (name === 'Sessions') return [`${value}`, 'Practice sessions'];
              if (name === 'Avg score') return [`${value}%`, 'Avg mock score'];
              return [`${value}`, `${name}`];
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 12, fontSize: 12 }}
            iconType="circle"
          />

          <Bar
            yAxisId="left"
            dataKey="sessions"
            name="Sessions"
            fill="url(#sessionsBar)"
            radius={[8, 8, 0, 0]}
            maxBarSize={42}
          >
            {data.map((d, i) => (
              <Cell key={i} fill="url(#sessionsBar)" />
            ))}
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgScore"
            name="Avg score"
            stroke={SCORE_LINE}
            strokeWidth={2.5}
            dot={{ r: 4, fill: SCORE_LINE, stroke: '#FFFFFF', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: SCORE_LINE, stroke: '#FFFFFF', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Mastery breakdown chips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
        {data.slice(0, 8).map((d) => {
          const m = classifyMastery(d.avgScore);
          return (
            <div
              key={d.domain}
              className="rounded-xl border bg-card px-3 py-2.5 flex items-center justify-between gap-2 hover:shadow-soft transition-all"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" title={d.domain}>
                  {d.domain}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {d.sessions} sessions · {d.mocks} mocks
                </p>
              </div>
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0"
                style={{
                  color: m.color,
                  backgroundColor: `${m.color}14`,
                }}
              >
                {d.avgScore > 0 ? `${d.avgScore}%` : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
