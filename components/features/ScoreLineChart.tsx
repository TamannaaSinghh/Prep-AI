'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ScoreLineChartProps {
  data: { date: string; score: number }[];
}

const PRIMARY = '#6C4CF1';
const PRIMARY_LIGHT = '#9F7AEA';

function formatDate(d: string) {
  try {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return d;
  }
}

export function ScoreLineChart({ data }: ScoreLineChartProps) {
  if (data.length === 0) return null;

  const formatted = data.map((d) => ({ ...d, label: formatDate(d.date) }));
  const average =
    formatted.reduce((sum, d) => sum + d.score, 0) / formatted.length;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={formatted} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
            <stop offset="100%" stopColor={PRIMARY_LIGHT} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="scoreStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={PRIMARY} />
            <stop offset="100%" stopColor={PRIMARY_LIGHT} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 4" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
          dy={6}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v) => `${v}%`}
        />

        <ReferenceLine
          y={average}
          stroke={PRIMARY_LIGHT}
          strokeDasharray="4 4"
          strokeOpacity={0.6}
          label={{
            value: `avg ${average.toFixed(0)}%`,
            fill: '#6B7280',
            fontSize: 10,
            position: 'insideTopRight',
          }}
        />

        <Tooltip
          cursor={{ stroke: PRIMARY, strokeWidth: 1, strokeOpacity: 0.3 }}
          contentStyle={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            padding: '8px 12px',
            fontSize: 12,
          }}
          labelStyle={{ color: '#1F2937', fontWeight: 600, marginBottom: 2 }}
          itemStyle={{ color: PRIMARY }}
          formatter={(value) => [`${value}%`, 'Score']}
        />

        <Area
          type="monotone"
          dataKey="score"
          stroke="url(#scoreStroke)"
          strokeWidth={2.5}
          fill="url(#scoreArea)"
          dot={{ r: 3.5, fill: PRIMARY, stroke: '#FFFFFF', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: PRIMARY, stroke: '#FFFFFF', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
