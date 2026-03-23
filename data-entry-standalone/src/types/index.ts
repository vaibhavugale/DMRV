// ─────────────────────────────────────────────────────
// Domain interfaces (mirrored from @dmrv/core-logic)
// ─────────────────────────────────────────────────────

// ─── Enums ───────────────────────────────────────────

export enum UserRole {
  ADMIN = 'admin',
  ENUMERATOR = 'enumerator',
  AUDITOR = 'auditor',
  PROJECT_DEVELOPER = 'project_developer',
}

export enum FarmerStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum TreeCondition {
  HEALTHY = 'healthy',
  STRESSED = 'stressed',
  DEAD = 'dead',
  REPLANTED = 'replanted',
  DISEASED = 'diseased',
}

export enum ActivityType {
  PLANTING = 'planting',
  MAINTENANCE = 'maintenance',
  PEST_CONTROL = 'pest_control',
  PRUNING = 'pruning',
  IRRIGATION = 'irrigation',
  MONITORING = 'monitoring',
  HARVESTING = 'harvesting',
  REPLANTING = 'replanting',
}

export enum PlotLandUse {
  CROPLAND = 'cropland',
  GRASSLAND = 'grassland',
  FOREST = 'forest',
  DEGRADED = 'degraded',
  AGROFORESTRY = 'agroforestry',
  BARREN = 'barren',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  CONFLICT = 'conflict',
  FAILED = 'failed',
}

// ─── GeoJSON ─────────────────────────────────────────

export interface IGeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IGeoJSONPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

// ─── Farmer ──────────────────────────────────────────

export interface ISocioEconomicData {
  householdSize: number;
  annualIncome?: number;
  primaryLivelihood: string;
  educationLevel?: string;
  accessToCredit: boolean;
  genderOfHousehold: 'male' | 'female' | 'other';
}

export interface IConsent {
  fpicGranted: boolean;
  consentDate: string;
  consentPhotoUrl?: string;
  witnessName?: string;
}

export interface IFarmer {
  _id?: string;
  farmerId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  contact: {
    phone?: string;
    email?: string;
    address?: string;
  };
  nationalId?: string;
  landTitleDeed?: string;
  status: FarmerStatus;
  registrationDate: string;
  socioEconomic: ISocioEconomicData;
  consent: IConsent;
  sdgTags?: number[];
  assignedEnumerator?: string;
  notes?: string;
  photoUrl?: string;
  projectId?: string;
  syncStatus?: SyncStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Farm Plot ───────────────────────────────────────

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
  plantingDensity?: number;
  projectInstance?: string;
  verificationStatus: 'unverified' | 'verified' | 'flagged';
  satelliteImageUrl?: string;
  notes?: string;
  projectId?: string;
  syncStatus?: SyncStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Tree Inventory ──────────────────────────────────

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
  dbhCm: number;
  heightM: number;
  canopyRadius?: number;
  conditionStatus: TreeCondition;
  plantingDate: string;
  ageYears?: number;
  photoEvidence?: string[];
  mortalityDate?: string;
  replantedTreeId?: string;
  carbonSequestered?: number;
  lastMeasurementDate?: string;
  measuredBy?: string;
  projectId?: string;
  syncStatus?: SyncStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Activity ────────────────────────────────────────

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
  duration?: number;
  inputs?: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  notes?: string;
  projectId?: string;
  syncStatus?: SyncStatus;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Project ─────────────────────────────────────────

export interface IProject {
  _id: string;
  name: string;
  certificationStandard?: string;
  methodology?: string;
  country?: string;
  region?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Auth ────────────────────────────────────────────

export interface IUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface IAuthResponse {
  message: string;
  token: string;
  user: IUser;
}

// ─── Sync ────────────────────────────────────────────

export interface ISyncPayload {
  type: 'farmer' | 'plot' | 'tree' | 'activity';
  data: any;
  localTimestamp: string;
  deviceId: string;
}

// ─── Navigation ──────────────────────────────────────

export type RootStackParamList = {
  Login: undefined;
  ProjectSelector: undefined;
  MainTabs: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
};

export type FarmerStackParamList = {
  FarmerList: undefined;
  FarmerForm: { farmer?: IFarmer } | undefined;
  FarmerDetails: { farmer: IFarmer };
  PlotForm: { plot?: IFarmPlot; farmerId: string } | undefined;
};

export type TreeStackParamList = {
  TreeList: undefined;
  TreeForm: { tree?: ITreeInventory } | undefined;
};

export type ActivityStackParamList = {
  ActivityList: undefined;
  ActivityForm: { activity?: IActivity } | undefined;
};
