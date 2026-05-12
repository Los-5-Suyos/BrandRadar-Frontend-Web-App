/**
 * UserStatus — Estado del ciclo de vida del usuario (DDD)
 * PENDING_VERIFICATION: cuenta creada pero email no verificado → no puede acceder a workspaces.
 * ACTIVE: verificado y operativo → acceso completo según su AccountType.
 * BLOCKED: bloqueado por intentos fallidos u otra regla de seguridad.
 */
export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  BLOCKED = 'BLOCKED',
}
