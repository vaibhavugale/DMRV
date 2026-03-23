import mongoose, { Schema, Document } from 'mongoose';

export interface ISaplingDemand extends Document {
  projectId: string;
  species: string;
  commonName: string;
  quantity: number;
  projectInstance: string;
  status: 'pending' | 'approved' | 'in_transit' | 'delivered' | 'rejected';
  requestedAt: Date;
  updatedAt: Date;
}

const SaplingDemandSchema: Schema = new Schema({
  projectId: { type: String, required: true },
  species: { type: String, required: true },
  commonName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  projectInstance: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'in_transit', 'delivered', 'rejected'],
    default: 'pending'
  },
}, { timestamps: true });

export const SaplingDemand = mongoose.model<ISaplingDemand>('SaplingDemand', SaplingDemandSchema);
