/**
 * UserRole — Value Object del dominio Brand Workspace
 * Define el rol del usuario dentro de un workspace.
 * Determina qué acciones puede ejecutar (crear marcas, desactivar, etc.)
 */
export enum UserRole {
  ADMIN   = 'ADMIN',
  MANAGER = 'MANAGER',
  VIEWER  = 'VIEWER',
}
