// Enums for the DMRV system

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  AUDITOR = 'auditor',
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

export enum CertificationStandard {
  VERRA_VCS = 'verra_vcs',
  GOLD_STANDARD = 'gold_standard',
  VERRA_CCB = 'verra_ccb',
}

export enum PlotLandUse {
  CROPLAND = 'cropland',
  GRASSLAND = 'grassland',
  FOREST = 'forest',
  DEGRADED = 'degraded',
  AGROFORESTRY = 'agroforestry',
  BARREN = 'barren',
}

export enum ReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum SyncStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  CONFLICT = 'conflict',
  FAILED = 'failed',
}
