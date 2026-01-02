import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  isAdmin: boolean;
  createdAt: Date;
  notificationsEnabled: boolean;
}

const UserSchema = new Schema<IUser>({
  telegramId: { type: Number, required: true, unique: true },
  username: String,
  firstName: { type: String, required: true },
  lastName: String,
  phone: String,
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  notificationsEnabled: { type: Boolean, default: true }
});

export default mongoose.model<IUser>('User', UserSchema);
