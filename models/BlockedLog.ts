import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBlockedLog extends Document {
  userId: mongoose.Types.ObjectId;
  reason: string;
  timestamp: Date;
}

const BlockedLogSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const BlockedLog: Model<IBlockedLog> = mongoose.models.BlockedLog || mongoose.model<IBlockedLog>('BlockedLog', BlockedLogSchema);

export default BlockedLog; 