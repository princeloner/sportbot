import mongoose, { Schema, Document } from 'mongoose';

export interface ITraining extends Document {
  clientId: mongoose.Types.ObjectId;
  date: Date;
  duration: number; // в минутах
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  notes?: string;
  reminderSent: boolean;
  createdAt: Date;
}

const TrainingSchema = new Schema<ITraining>({
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  duration: { type: Number, default: 60 },
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled', 'missed'],
    default: 'scheduled'
  },
  notes: String,
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

TrainingSchema.index({ date: 1, clientId: 1 });

export default mongoose.model<ITraining>('Training', TrainingSchema);
