'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface ProgressChartProps {
  data: { domain: string; sessions: number }[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis />
        <Radar
          name="Sessions"
          dataKey="sessions"
          stroke="hsl(221.2, 83.2%, 53.3%)"
          fill="hsl(221.2, 83.2%, 53.3%)"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
