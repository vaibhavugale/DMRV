// Monitoring report interfaces for VCS and Gold Standard
import { CertificationStandard, ReportStatus } from '../../constants';

export interface ILeakageAssessment {
  leakageRiskIdentified: boolean;
  leakageType?: string;
  mitigationMeasures?: string[];
  leakageDeduction: number; // percentage
}

export interface INonPermanenceRisk {
  internalRisk: number;
  externalRisk: number;
  naturalRisk: number;
  totalBufferPercentage: number;
}

export interface IMonitoringReport {
  _id?: string;
  reportId: string;
  projectName: string;
  projectId: string;
  standard: CertificationStandard;
  methodology: string;
  verificationPeriodStart: string;
  verificationPeriodEnd: string;
  status: ReportStatus;
  totalFarmers: number;
  totalPlots: number;
  totalTrees: number;
  totalAreaHectares: number;
  baselineCarbon: number;
  projectCarbon: number;
  netSequestration: number;
  leakageAssessment: ILeakageAssessment;
  nonPermanenceRisk: INonPermanenceRisk;
  creditsRequested: number;
  sdgContributions?: { sdgId: number; description: string; indicator: string }[];
  photoEvidenceUrls: string[];
  generatedBy: string;
  generatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}
