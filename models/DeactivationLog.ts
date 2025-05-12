import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDeactivationLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: 'deactivate' | 'reactivate'; 
  actionBy: mongoose.Types.ObjectId;
  timestamp: Date;
}

const DeactivationLogSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['deactivate', 'reactivate'],
    required: true,
  },
  actionBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const DeactivationLog: Model<IDeactivationLog> = mongoose.models.DeactivationLog || mongoose.model<IDeactivationLog>('DeactivationLog', DeactivationLogSchema);

export default DeactivationLog; 