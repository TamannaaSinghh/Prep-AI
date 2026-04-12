import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
  lastLogin: Date;
  preferences: {
    defaultDomain?: string;
    defaultDifficulty?: 'beginner' | 'intermediate' | 'advanced';
    dailyGoal?: number;
  };
}

const UserSchema = new Schema<IUser>({
  email:     { type: String, required: true, unique: true, lowercase: true },
  name:      { type: String, required: true },
  image:     { type: String },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  preferences: {
    defaultDomain:     { type: String },
    defaultDifficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    dailyGoal:         { type: Number, default: 10 },
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
