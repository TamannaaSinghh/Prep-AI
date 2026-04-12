import mongoose, { Schema, Document, Types } from 'mongoose';

interface IQuestion {
  question: string;
  explanation: string;
  tags: string[];
  bookmarked: boolean;
}

export interface IQuestionSession extends Document {
  userId: Types.ObjectId;
  domain: string;
  topic: string;
  subtopic?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: IQuestion[];
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  question:    { type: String, required: true },
  explanation: { type: String, required: true },
  tags:        [{ type: String }],
  bookmarked:  { type: Boolean, default: false },
});

const QuestionSessionSchema = new Schema<IQuestionSession>({
  userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  domain:     { type: String, required: true },
  topic:      { type: String, required: true },
  subtopic:   { type: String, default: '' },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  questions:  [QuestionSchema],
  createdAt:  { type: Date, default: Date.now },
});

export default mongoose.models.QuestionSession ||
  mongoose.model<IQuestionSession>('QuestionSession', QuestionSessionSchema);
