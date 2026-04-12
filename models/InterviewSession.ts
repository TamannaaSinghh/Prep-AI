import mongoose, { Schema, Document, Types } from 'mongoose';

interface IAnswer {
  question: string;
  userAnswer: string;
  score: number;
  feedback: string;
  modelAnswer: string;
  timeTaken: number;
}

export interface IInterviewSession extends Document {
  userId: Types.ObjectId;
  domain: string;
  topic?: string;
  subtopic?: string;
  totalQuestions: number;
  totalScore: number;
  maxScore: number;
  answers: IAnswer[];
  completedAt: Date;
  durationSeconds: number;
}

const AnswerSchema = new Schema<IAnswer>({
  question:    { type: String, required: true },
  userAnswer:  { type: String, required: true },
  score:       { type: Number, min: 0, max: 10, required: true },
  feedback:    { type: String, required: true },
  modelAnswer: { type: String, required: true },
  timeTaken:   { type: Number, required: true },
});

const InterviewSessionSchema = new Schema<IInterviewSession>({
  userId:          { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  domain:          { type: String, required: true },
  topic:           { type: String, default: '' },
  subtopic:        { type: String, default: '' },
  totalQuestions:  { type: Number, required: true },
  totalScore:      { type: Number, required: true },
  maxScore:        { type: Number, required: true },
  answers:         [AnswerSchema],
  completedAt:     { type: Date, default: Date.now },
  durationSeconds: { type: Number, required: true },
});

export default mongoose.models.InterviewSession ||
  mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);
