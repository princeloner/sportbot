import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeSlot extends Document {
  dayOfWeek: number; // 0-6 (воскресенье-суббота)
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  isActive: boolean;
  maxClients: number;
}

const TimeSlotSchema = new Schema<ITimeSlot>({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  maxClients: { type: Number, default: 1 }
});

export default mongoose.model<ITimeSlot>('TimeSlot', TimeSlotSchema);
