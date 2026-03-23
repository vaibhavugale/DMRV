// Farmer interface for the DMRV system
import { FarmerStatus } from '@dmrv/constants';

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
  createdAt?: string;
  updatedAt?: string;
}
