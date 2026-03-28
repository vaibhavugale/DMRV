import { Schema, model, Document, Types } from 'mongoose';
import { PlotLandUse } from '../shared/constants';
import { isValidPolygon } from '../shared/core-logic';

export interface IFarmPlotDoc extends Document {
  plotId: string;
  farmerId: string;
  name: string;
  boundary: {
    type: string;
    coordinates: number[][][];
  };
  centroid: {
    type: string;
    coordinates: number[];
  };
  areaHectares: number;
  elevation?: number;
  soilType?: string;
  landUseHistory: {
    year: number;
    landUse: PlotLandUse;
    description?: string;
  }[];
  currentLandUse: PlotLandUse;
  plantingDensity?: number;
  projectInstance?: string;
  verificationStatus: string;
  satelliteImageUrl?: string;
  notes?: string;
  baseline: {
    initialSoilCarbonContent: number;
    existingTreeCount: number;
    historicalLandUse: PlotLandUse;
    baselineBiomassCO2e: number;
  };
  projectId: Types.ObjectId;
}

const FarmPlotSchema = new Schema<IFarmPlotDoc>(
  {
    plotId: { type: String, required: true, unique: true, index: true },
    farmerId: { type: String, required: true, index: true, ref: 'Farmer' },
    name: { type: String, required: true },
    boundary: {
      type: { type: String, default: 'Polygon', enum: ['Polygon'] },
      coordinates: { type: [[[Number]]], required: true },
    },
    centroid: {
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: { type: [Number], default: [0, 0] },
    },
    areaHectares: { type: Number, required: true },
    elevation: Number,
    soilType: String,
    landUseHistory: [
      {
        year: Number,
        landUse: { type: String, enum: Object.values(PlotLandUse), required: true },
        description: String,
      },
    ],
    currentLandUse: {
      type: String,
      enum: Object.values(PlotLandUse),
      default: PlotLandUse.AGROFORESTRY,
    },
    plantingDensity: Number,
    projectInstance: String,
    verificationStatus: {
      type: String,
      enum: ['unverified', 'verified', 'flagged', 'Monitoring Active', 'Reversal Detected'],
      default: 'unverified',
    },
    satelliteImageUrl: String,
    notes: String,
    baseline: {
      initialSoilCarbonContent: { type: Number, required: true, default: 0 },
      existingTreeCount: { type: Number, required: true, default: 0 },
      historicalLandUse: { type: String, enum: Object.values(PlotLandUse), required: true },
      baselineBiomassCO2e: { type: Number, required: true, default: 0 }
    },
    projectId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true,
      index: true 
    }
  },
  { timestamps: true }
);

// 2dsphere index on boundary for geospatial queries
FarmPlotSchema.index({ boundary: '2dsphere' });
FarmPlotSchema.index({ centroid: '2dsphere' });

// Auto-calculate centroid before saving
FarmPlotSchema.pre('save', function (next) {
  const doc = this as unknown as IFarmPlotDoc;
  if (doc.boundary && doc.boundary.coordinates && doc.boundary.coordinates[0]) {
    const coords = doc.boundary.coordinates[0];
    const n = coords.length - 1; // Exclude closing point
    let sumLng = 0;
    let sumLat = 0;
    for (let i = 0; i < n; i++) {
      sumLng += coords[i][0];
      sumLat += coords[i][1];
    }
    doc.centroid = {
      type: 'Point',
      coordinates: [sumLng / n, sumLat / n],
    };
  }
  next();
});

export const FarmPlot = model<IFarmPlotDoc>('FarmPlot', FarmPlotSchema);
