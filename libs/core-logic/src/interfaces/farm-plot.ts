// Farm Plot interface with GeoJSON geometry
import { PlotLandUse } from '@dmrv/constants';

export interface IGeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IGeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // Array of linear rings
}

export interface ILandUseHistory {
  year: number;
  landUse: PlotLandUse;
  description?: string;
}

export interface IFarmPlot {
  _id?: string;
  plotId: string;
  farmerId: string;
  name: string;
  boundary: IGeoJSONPolygon;
  centroid?: IGeoJSONPoint;
  areaHectares: number;
  elevation?: number;
  soilType?: string;
  landUseHistory: ILandUseHistory[];
  currentLandUse: PlotLandUse;
  plantingDensity?: number; // trees per hectare
  projectInstance?: string;
  verificationStatus: 'unverified' | 'verified' | 'flagged';
  satelliteImageUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
