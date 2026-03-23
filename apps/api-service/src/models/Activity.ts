import { Schema, model, Document, Types } from 'mongoose';
import { ActivityType } from '@dmrv/constants';

export interface IActivityDoc extends Document {
  activityId: string;
  farmerId: string;
  plotId: string;
  treeId?: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  performedBy: string;
  gpsTrail?: number[][];
  photoEvidence: string[];
  duration?: number;
  inputs?: { name: string; quantity: number; unit: string }[];
  notes?: string;
  projectId: Types.ObjectId;
}

const ActivitySchema = new Schema<IActivityDoc>(
  {
    activityId: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true },
    plotId: { type: String, required: true, index: true },
    treeId: String,
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
    },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    performedBy: { type: String, required: true },
    gpsTrail: [[Number]],
    photoEvidence: [String],
    duration: Number,
    inputs: [
      {
        name: String,
        quantity: Number,
        unit: String,
      },
    ],
    notes: String,
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true,
      index: true 
    },
  },
  { timestamps: true }
);

ActivitySchema.index({ timestamp: -1 });

export const Activity = model<IActivityDoc>('Activity', ActivitySchema);
