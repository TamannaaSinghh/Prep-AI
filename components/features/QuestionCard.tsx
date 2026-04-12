'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Question } from '@/types';
import { ChevronDown, ChevronUp, Bookmark } from 'lucide-react';

interface QuestionCardProps {
  question:    Question;
  index:       number;
  onBookmark?: (question: Question) => void;
}

export function QuestionCard({ question, index, onBookmark }: QuestionCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium text-sm text-muted-foreground mb-2">Q{index + 1}</p>
            <p className="text-base font-medium">{question.question}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {question.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
          {onBookmark && (
            <Button variant="ghost" size="icon" onClick={() => onBookmark(question)}>
              <Bookmark className={`h-4 w-4 ${question.bookmarked ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          className="mt-4 text-sm"
          onClick={() => setShowExplanation(prev => !prev)}
        >
          {showExplanation ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
          {showExplanation ? 'Hide explanation' : 'Show explanation'}
        </Button>

        {showExplanation && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {question.explanation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
