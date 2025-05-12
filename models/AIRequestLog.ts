import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAIRequestLog extends Document {
  userId: mongoose.Types.ObjectId;
  timestamp: Date;
  tokensUsed: number;
  cost: number;
  requestType?: string;
}

const AIRequestLogSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  tokensUsed: {
    type: Number,
    required: true,
    default: 0,
  },
  cost: {
    type: Number,
    required: true,
    default: 0,
  },
  requestType: {
    type: String,
  },
});

// Create index for efficient queries by userId and timestamp
AIRequestLogSchema.index({ userId: 1, timestamp: -1 });

const AIRequestLog: Model<IAIRequestLog> = mongoose.models.AIRequestLog || mongoose.model<IAIRequestLog>('AIRequestLog', AIRequestLogSchema);

export default AIRequestLog; 