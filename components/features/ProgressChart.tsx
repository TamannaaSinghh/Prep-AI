'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ProgressChartProps {
  data: { domain: string; sessions: number }[];
}

const PRIMARY = '#6C4CF1';
const PRIMARY_LIGHT = '#9F7AEA';

export function ProgressChart({ data }: ProgressChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius="72%">
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.55} />
            <stop offset="100%" stopColor={PRIMARY_LIGHT} stopOpacity={0.2} />
          </linearGradient>
        </defs>

        <PolarGrid stroke="#E5E7EB" strokeDasharray="3 4" />
        <PolarAngleAxis
          dataKey="domain"
          tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }}
        />
        <PolarRadiusAxis
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
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
          formatter={(value) => [`${value} sessions`, 'Practice']}
        />
        <Radar
          name="Sessions"
          dataKey="sessions"
          stroke={PRIMARY}
          strokeWidth={2}
          fill="url(#radarFill)"
          dot={{ r: 4, fill: PRIMARY, stroke: '#FFFFFF', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: PRIMARY, stroke: '#FFFFFF', strokeWidth: 2 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
