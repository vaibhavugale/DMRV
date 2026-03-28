// Tree Inventory interface for carbon tracking
import { TreeCondition } from '../../constants';
import { IGeoJSONPoint } from './farm-plot';

export interface ITreeInventory {
  _id?: string;
  treeId: string;
  plotId: string;
  farmerId: string;
  coordinates: IGeoJSONPoint;
  speciesScientific: string;
  speciesCommon?: string;
  family: string;
  genus: string;
  species: string;
  dbhCm: number;           // Diameter at Breast Height (cm)
  heightM: number;          // Height (meters)
  canopyRadius?: number;    // Crown radius (meters)
  conditionStatus: TreeCondition;
  plantingDate: string;
  ageYears?: number;
  photoEvidence?: string[];
  mortalityDate?: string;
  replantedTreeId?: string;
  carbonSequestered?: number; // tCO2e calculated
  lastMeasurementDate?: string;
  measuredBy?: string;
  syncStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}
