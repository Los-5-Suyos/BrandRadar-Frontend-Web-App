import { WorkspacePlan } from '../enums/workspace-plan.enum';
import { UserRole } from '../enums/user-role.enum';

/**
 * WorkspaceModel — Aggregate Root del dominio Brand Workspace
 * Representa un workspace al que el usuario tiene acceso.
 * Protege el aislamiento entre marcas y controla el acceso por rol.
 */
export interface WorkspaceModel {
  id: string;
  name: string;
  plan: WorkspacePlan;
  status: 'ACTIVA' | 'INACTIVA';
  activeBrandsCount: number;
  userRole: UserRole;
  adminEmail?: string;
  logoUrl?: string;
}
