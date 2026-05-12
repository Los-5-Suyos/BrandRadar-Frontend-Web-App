/**
 * AccountType — Value Object de dominio
 * Determina los permisos del usuario dentro de un workspace.
 * INDIVIDUAL: acceso personal, solo puede ver marcas asignadas a él.
 * EMPRESA: acceso organizacional, puede ver múltiples marcas del workspace.
 */
export enum AccountType {
  INDIVIDUAL = 'individual',
  EMPRESA = 'empresa',
}
