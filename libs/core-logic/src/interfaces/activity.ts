// Activity logging interface
import { ActivityType } from '@dmrv/constants';

export interface IActivity {
  _id?: string;
  activityId: string;
  farmerId: string;
  plotId: string;
  treeId?: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  performedBy: string;
  gpsTrail?: [number, number][];
  photoEvidence?: string[];
  duration?: number; // minutes
  inputs?: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  notes?: string;
  syncStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}
