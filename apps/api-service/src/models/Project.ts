import { Schema, model, Document } from 'mongoose';

export interface IGeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

export interface IProject extends Document {
  name: string;
  region: string;
  startDate: Date;
  methodology: string; // e.g., 'VM0047', 'Gold Standard ARR'
  isActive: boolean;
  baseline: {
    referencePeriodStart: Date;
    referencePeriodEnd: Date;
    controlArea: IGeoJSONMultiPolygon;
    baselineEmissionsFactorCO2ePerHa: number;
  };
  lcaSettings: {
    transportEmissionsFactorCO2ePerKm: number;
    fertilizerEmissionsFactorCO2ePerKg: number;
    defaultWoodDensity: number; // Fallback Wood Density if species not in registry
  };
  sdgTargets: number[]; // Array of SDG goals this project aims for
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  region: { type: String, required: true },
  startDate: { type: Date, required: true },
  methodology: { type: String, required: true, default: 'VM0047' },
  isActive: { type: Boolean, default: true },
  baseline: {
    referencePeriodStart: { type: Date, required: true },
    referencePeriodEnd: { type: Date, required: true },
    controlArea: {
      type: {
        type: String,
        enum: ['MultiPolygon'],
        required: false
      },
      coordinates: {
        type: [[[[Number]]]], 
        required: false
      }
    },
    baselineEmissionsFactorCO2ePerHa: { type: Number, default: 0 }
  },
  lcaSettings: {
    transportEmissionsFactorCO2ePerKm: { type: Number, default: 0.15 },
    fertilizerEmissionsFactorCO2ePerKg: { type: Number, default: 2.5 },
    defaultWoodDensity: { type: Number, default: 0.5 }
  },
  sdgTargets: [{ type: Number }]
}, { timestamps: true });

// Geospatial index for baseline control areas
ProjectSchema.index({ 'baseline.controlArea': '2dsphere' });

export const Project = model<IProject>('Project', ProjectSchema);
