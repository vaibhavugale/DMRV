import { Schema, model, Document, Types } from 'mongoose';
import { TreeCondition } from '@dmrv/constants';
import { SPECIES_REGISTRY } from '@dmrv/constants';

export interface ITreeDoc extends Document {
  treeId: string;
  plotId: string;
  farmerId: string;
  coordinates: {
    type: string;
    coordinates: number[];
  };
  speciesScientific: string;
  speciesCommon: string;
  family: string;
  genus: string;
  species: string;
  dbhCm: number;
  heightM: number;
  canopyRadius?: number;
  conditionStatus: TreeCondition;
  plantingDate: Date;
  ageYears?: number;
  photoEvidence: string[];
  mortalityDate?: Date;
  replantedTreeId?: string;
  carbonSequestered?: number;
  lastMeasurementDate?: Date;
  measuredBy?: string;
  projectId: Types.ObjectId;
  farmId: Types.ObjectId;
}

const TreeSchema = new Schema<ITreeDoc>(
  {
    treeId: { type: String, required: true, unique: true, index: true },
    plotId: { type: String, required: true, index: true, ref: 'FarmPlot' },
    farmerId: { type: String, required: true, index: true, ref: 'Farmer' },
    coordinates: {
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: { type: [Number], required: true },
    },
    speciesScientific: { type: String, required: true },
    speciesCommon: { type: String },
    family: { type: String, required: true },
    genus: { type: String, required: true },
    species: { type: String, required: true },
    dbhCm: { type: Number, required: true, min: 0 },
    heightM: { type: Number, required: true, min: 0 },
    canopyRadius: { type: Number, min: 0 },
    plantingDate: { type: Date, required: true },
    ageYears: Number,
    photoEvidence: [String],
    mortalityDate: Date,
    replantedTreeId: String,
    carbonSequestered: { type: Number, default: 0 },
    lastMeasurementDate: Date,
    measuredBy: String,
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    farmId: {
      type: Schema.Types.ObjectId,
      ref: 'FarmPlot',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
TreeSchema.index({ coordinates: '2dsphere' });

// Pre-save: validate species against the scientific decision tree
TreeSchema.pre('save', function (next) {
  const doc = this as unknown as ITreeDoc;
  const validSpecies = SPECIES_REGISTRY.find(
    (s) => s.scientificName === doc.speciesScientific
  );
  if (!validSpecies) {
    // Allow unknown species but log a warning
    console.warn(`\u26A0\uFE0F Species "${doc.speciesScientific}" not found in registry for tree ${doc.treeId}`);
  } else {
    // Auto-fill derived fields
    doc.speciesCommon = validSpecies.commonName;
    doc.family = validSpecies.family;
    doc.genus = validSpecies.genus;
    doc.species = validSpecies.species;
  }

  // Calculate age from planting date
  if (doc.plantingDate) {
    const now = new Date();
    doc.ageYears = Math.floor(
      (now.getTime() - new Date(doc.plantingDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
  }

  next();
});

export const Tree = model<ITreeDoc>('Tree', TreeSchema);
