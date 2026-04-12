import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EvaluationResult } from '@/types';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface FeedbackPanelProps {
  result: EvaluationResult;
}

export function FeedbackPanel({ result }: FeedbackPanelProps) {
  const scoreColor = result.score >= 7 ? 'text-green-600' : result.score >= 4 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Feedback</span>
          <span className={`text-3xl font-bold ${scoreColor}`}>{result.score}/10</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.strengths.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4" /> Strengths
            </p>
            <ul className="space-y-1">
              {result.strengths.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground">• {s}</li>
              ))}
            </ul>
          </div>
        )}

        {result.gaps.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4" /> Gaps
            </p>
            <ul className="space-y-1">
              {result.gaps.map((g, i) => (
                <li key={i} className="text-sm text-muted-foreground">• {g}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4" /> Feedback
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.feedback}</p>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm font-semibold mb-2">Model Answer</p>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {result.modelAnswer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
