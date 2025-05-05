import mongoose, { Document } from 'mongoose';

export interface ILog extends Document {
  requestId?: string;
  userId?: string;
  userIp?: string;
  action: string;
  collectionName: string;
  valuesOld: string;
  valuesNew: string;
  createdAt: Date;
}

const LogSchema = new mongoose.Schema(
  {
    requestId: {
      type: String
    },
    userId: {
      type: String,
      ref: 'User'
    },
    userIp: {
      type: String
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: ['CREATE', 'UPDATE', 'DELETE', 'SOFT DELETE', 'RESTORE', 'BULK CREATE']
    },
    collectionName: {
      type: String,
      required: [true, 'Collection name is required']
    },
    valuesOld: {
      type: String,
      default: '{}'
    },
    valuesNew: {
      type: String,
      default: '{}'
    }
  },
  {
    timestamps: true
  }
);

const LogModel = mongoose.model<ILog>('Log', LogSchema);

export default LogModel;