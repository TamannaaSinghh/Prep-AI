'use client';

import { Difficulty } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DomainSelectorProps {
  domain: string;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  onDomainChange: (val: string) => void;
  onTopicChange: (val: string) => void;
  onSubtopicChange: (val: string) => void;
  onDifficultyChange: (val: Difficulty) => void;
}

export function DomainSelector({
  domain,
  topic,
  subtopic,
  difficulty,
  onDomainChange,
  onTopicChange,
  onSubtopicChange,
  onDifficultyChange,
}: DomainSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Domain</label>
        <Input
          placeholder="e.g. Machine Learning, React..."
          value={domain}
          onChange={(e) => onDomainChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Topic</label>
        <Input
          placeholder="e.g. Neural Networks, Hooks..."
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Sub-topic <span className="text-muted-foreground font-normal">(optional)</span></label>
        <Input
          placeholder="e.g. Backpropagation, useEffect..."
          value={subtopic}
          onChange={(e) => onSubtopicChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Difficulty</label>
        <Select value={difficulty} onValueChange={(val) => onDifficultyChange(val as Difficulty)}>
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
