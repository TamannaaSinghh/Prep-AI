import mongoose, { Schema, Document, Types } from 'mongoose';

interface IConversationTurn {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ITopicScore {
  topic: string;
  score: number;
  comment: string;
}

interface IEvaluation {
  strengths: string[];
  weaknesses: string[];
  topicScores: ITopicScore[];
  summary: string;
  recommendation: string;
}

export interface IVoiceInterviewSession extends Document {
  userId: Types.ObjectId;
  domain: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  conversationTurns: IConversationTurn[];
  totalTurns: number;
  overallScore: number;
  evaluation: IEvaluation;
  completedAt: Date;
  durationSeconds: number;
}

const ConversationTurnSchema = new Schema<IConversationTurn>({
  role:      { type: String, enum: ['user', 'ai'], required: true },
  content:   { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const TopicScoreSchema = new Schema<ITopicScore>({
  topic:   { type: String, required: true },
  score:   { type: Number, required: true },
  comment: { type: String, required: true },
});

const EvaluationSchema = new Schema<IEvaluation>({
  strengths:   [{ type: String }],
  weaknesses:  [{ type: String }],
  topicScores: [TopicScoreSchema],
  summary:     { type: String, default: '' },
  recommendation: { type: String, default: '' },
});

const VoiceInterviewSessionSchema = new Schema<IVoiceInterviewSession>({
  userId:            { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  domain:            { type: String, required: true },
  topic:             { type: String, required: true },
  subtopic:          { type: String, default: '' },
  difficulty:        { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  conversationTurns: [ConversationTurnSchema],
  totalTurns:        { type: Number, required: true },
  overallScore:      { type: Number, required: true },
  evaluation:        { type: EvaluationSchema, required: true },
  completedAt:       { type: Date, default: Date.now },
  durationSeconds:   { type: Number, required: true },
});

export default mongoose.models.VoiceInterviewSession ||
  mongoose.model<IVoiceInterviewSession>('VoiceInterviewSession', VoiceInterviewSessionSchema);
