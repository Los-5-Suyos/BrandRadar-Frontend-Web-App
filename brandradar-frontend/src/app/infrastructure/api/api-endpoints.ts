// src/app/infrastructure/api/api-endpoints.ts

export const API_BASE_URL = 'http://localhost:3000'; // Asegúrate de que tu json-server use este puerto

export const ENDPOINTS = {
  // Autenticación
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,

  // Gestión de Marcas y Workspaces
  WORKSPACES: `${API_BASE_URL}/workspaces`,
  BRANDS: `${API_BASE_URL}/brands`,

  // Monitoreo de Reputación (Menciones y Sentimientos)
  MENTIONS: (brandId: string) => `${API_BASE_URL}/mentions?brandId=${brandId}`,
  MENTIONS_BY_SENTIMENT: (brandId: string, sentiment: string) =>
    `${API_BASE_URL}/mentions?brandId=${brandId}&sentimentType=${sentiment}`,
  SENTIMENT_HISTORY: (brandId: string) => `${API_BASE_URL}/sentimentHistory?brandId=${brandId}`,

  // Detección de Crisis (Patrones e Incidentes)
  PATTERNS: `${API_BASE_URL}/patterns`,
  PATTERNS_DISMISS: (id: string) => `${API_BASE_URL}/patterns/${id}`,
  INCIDENTS: `${API_BASE_URL}/incidents`,

  // Alertas y Reglas
  ALERTS: `${API_BASE_URL}/alerts`,
  MONITORING_RULES: `${API_BASE_URL}/monitoringRules`,

  // Reportes y Auditoría
  REPORTS: `${API_BASE_URL}/reports`,
  AUDIT_LOGS: `${API_BASE_URL}/auditLogs`,
};
