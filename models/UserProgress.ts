import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserProgress extends Document {
  userId: Types.ObjectId;
  interviewDate?: Date;
  interviewRole?: string;   // e.g. "Frontend Engineer", "Data Scientist"
  streak: number;           // current consecutive active days ending today (or yesterday w/ grace)
  longestStreak: number;
  activityDates: string[];  // unique ISO YYYY-MM-DD strings
  coins: number;            // lifetime coins earned (1 coin per 6-day streak milestone)
  updatedAt: Date;
}

const UserProgressSchema = new Schema<IUserProgress>({
  userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  interviewDate: { type: Date },
  interviewRole: { type: String, trim: true, maxlength: 120 },
  streak:        { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  activityDates: { type: [String], default: [] },
  coins:         { type: Number, default: 0 },
  updatedAt:     { type: Date, default: Date.now },
});

export default mongoose.models.UserProgress ||
  mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
