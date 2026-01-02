import mongoose, { Schema, Document } from 'mongoose';

export interface ITutorial extends Document {
  style: string; // 'butterfly', 'backstroke', 'breaststroke', 'freestyle'
  title: string;
  description: string;
  photoPath?: string;
  photoUrl?: string;
  voicePath?: string;
  voiceUrl?: string;
  videoPath?: string;
  videoUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
}

const TutorialSchema = new Schema<ITutorial>({
  style: { 
    type: String, 
    required: true,
    enum: ['butterfly', 'backstroke', 'breaststroke', 'freestyle', 'general']
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  photoPath: String,
  photoUrl: String,
  voicePath: String,
  voiceUrl: String,
  videoPath: String,
  videoUrl: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

TutorialSchema.index({ style: 1, order: 1 });

export default mongoose.model<ITutorial>('Tutorial', TutorialSchema);
