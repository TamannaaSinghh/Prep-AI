export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Question {
  question:    string;
  explanation: string;
  tags:        string[];
  bookmarked?: boolean;
}

export interface EvaluationResult {
  score:       number;
  strengths:   string[];
  gaps:        string[];
  feedback:    string;
  modelAnswer: string;
}

export interface QuestionSessionSummary {
  _id:        string;
  domain:     string;
  topic:      string;
  subtopic:   string;
  difficulty: Difficulty;
  count:      number;
  createdAt:  string;
}

export interface InterviewSessionSummary {
  _id:             string;
  domain:          string;
  topic:           string;
  subtopic:        string;
  totalScore:      number;
  maxScore:        number;
  percentage:      number;
  totalQuestions:  number;
  completedAt:     string;
  durationSeconds: number;
}

export interface DomainConfig {
  label:  string;
  topics: string[];
}

// Voice Interview types
export interface ConversationMessage {
  role:      'ai' | 'user';
  content:   string;
  timestamp: string;
}

export interface VoiceEvaluation {
  overallScore:   number;
  strengths:      string[];
  weaknesses:     string[];
  topicScores:    { topic: string; score: number; comment: string }[];
  summary:        string;
  recommendation: string;
}

export interface VoiceInterviewSessionSummary {
  _id:             string;
  domain:          string;
  topic:           string;
  subtopic:        string;
  overallScore:    number;
  totalTurns:      number;
  completedAt:     string;
  durationSeconds: number;
}
