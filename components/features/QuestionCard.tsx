'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Question } from '@/types';
import { ChevronDown, ChevronUp, Bookmark, Lightbulb } from 'lucide-react';
import { MarkdownContent } from '@/components/features/MarkdownContent';

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
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs text-muted-foreground mb-2 uppercase tracking-wider">
              Question {index + 1}
            </p>
            <p className="text-base font-medium leading-relaxed">
              {question.question}
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-accent text-primary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          {onBookmark && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onBookmark(question)}
              aria-label={question.bookmarked ? 'Remove bookmark' : 'Bookmark this question'}
              className="shrink-0"
            >
              <Bookmark
                className={`h-4 w-4 ${question.bookmarked ? 'fill-primary text-primary' : ''}`}
              />
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          className="mt-4 text-sm gap-2 -ml-2 text-primary hover:text-primary hover:bg-accent"
          onClick={() => setShowExplanation((prev) => !prev)}
        >
          {showExplanation ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {showExplanation ? 'Hide answer' : 'Show answer'}
        </Button>

        {showExplanation && (
          <div className="mt-3 rounded-2xl border bg-gradient-to-br from-accent/40 via-card to-primary/5 overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b bg-card/50 backdrop-blur">
              <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <Lightbulb className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Answer
              </p>
            </div>

            {/* Markdown body */}
            <div className="p-5">
              <MarkdownContent content={question.explanation} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
