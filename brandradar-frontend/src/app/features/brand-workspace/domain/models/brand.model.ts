import { BrandStatus } from '../enums/brand-status.enum';

/**
 * BrandModel — Entidad del dominio Brand Workspace
 * Representa una marca monitoreada dentro de un workspace.
 */
export interface BrandModel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  status: BrandStatus;
  reputationScore: number;
  mentionsLast7Days: number;
  keywords: string[];
  createdAt: string;
}
