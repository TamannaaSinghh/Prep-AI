import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  userId: Types.ObjectId;
  question: string;
  explanation: string;
  domain: string;
  topic: string;
  savedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  question:    { type: String, required: true },
  explanation: { type: String, required: true },
  domain:      { type: String, required: true },
  topic:       { type: String, required: true },
  savedAt:     { type: Date, default: Date.now },
});

BookmarkSchema.index({ userId: 1, question: 1 }, { unique: true });

export default mongoose.models.Bookmark ||
  mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
