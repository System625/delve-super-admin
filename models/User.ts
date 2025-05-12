import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin';
  account_type: 'free' | 'paid';
  subscription_tier?: string;
  subscription_cost?: number;
  isBlocked: boolean;
  isDeactivated: boolean;
  dailyAICallCount: number;
  lastUsageReset: Date;
  total_tokens_used: number;
  total_cost: number;
  created_at: Date;
  updated_at: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user',
  },
  account_type: {
    type: String,
    enum: ['free', 'paid'],
    default: 'free',
  },
  subscription_tier: {
    type: String,
  },
  subscription_cost: {
    type: Number,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  isDeactivated: {
    type: Boolean,
    default: false,
  },
  dailyAICallCount: {
    type: Number,
    default: 0,
  },
  lastUsageReset: {
    type: Date,
    default: Date.now,
  },
  total_tokens_used: {
    type: Number,
    default: 0,
  },
  total_cost: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 