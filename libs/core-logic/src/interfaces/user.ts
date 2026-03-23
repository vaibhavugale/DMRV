// User interface with RBAC
import { UserRole } from '@dmrv/constants';

export interface IUser {
  _id?: string;
  userId: string;
  email: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  assignedPlots?: string[];
  assignedFarmers?: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}
