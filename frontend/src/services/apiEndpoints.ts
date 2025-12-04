/**
 * All API endpoint URLs
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/password',
  },

  // Properties
  PROPERTIES: {
    LIST: '/properties',
    CREATE: '/properties',
    GET: (id: string) => `/properties/${id}`,
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
    MAP_DATA: '/properties/map/data',
    QUICK_CAPTURE: '/properties/quick-capture',
    QUICK_CAPTURE_BATCH: '/properties/quick-capture/batch',
  },

  // Deal Scenarios
  SCENARIOS: {
    LIST: (propertyId: string) => `/properties/${propertyId}/scenarios`,
    CREATE: (propertyId: string) => `/properties/${propertyId}/scenarios`,
    GET: (scenarioId: string) => `/scenarios/${scenarioId}`,
    UPDATE: (scenarioId: string) => `/scenarios/${scenarioId}`,
    DELETE: (scenarioId: string) => `/scenarios/${scenarioId}`,
  },

  // Analysis
  ANALYSIS: {
    ANALYZE: (scenarioId: string) => `/scenarios/${scenarioId}/analyze`,
    COMPARE: '/analysis/compare-scenarios',
    MORTGAGE_SCHEDULE: '/analysis/mortgage-schedule',
  },

  // Renovations
  RENOVATIONS: {
    LIST: (propertyId: string) => `/properties/${propertyId}/renovations`,
    CREATE: (propertyId: string) => `/properties/${propertyId}/renovations`,
    GET: (renovationId: string) => `/renovations/${renovationId}`,
    UPDATE: (renovationId: string) => `/renovations/${renovationId}`,
    DELETE: (renovationId: string) => `/renovations/${renovationId}`,
    STATS: (propertyId: string) => `/properties/${propertyId}/renovations/stats`,
  },

  // Alerts
  ALERTS: {
    LIST: '/alerts',
    GET: (id: string) => `/alerts/${id}`,
    MARK_READ: (id: string) => `/alerts/${id}/read`,
    MARK_ALL_READ: '/alerts/mark-all-read',
    DELETE: (id: string) => `/alerts/${id}`,
    STATS: '/alerts/stats',
  },

  // Dashboard
  DASHBOARD: {
    KPI: '/dashboard/kpi',
    PORTFOLIO_TREND: '/dashboard/portfolio-trend',
    DEAL_FLOW: '/dashboard/deal-flow',
    PROPERTY_TYPES: '/dashboard/property-types',
    RECENT_ACTIVITY: '/dashboard/recent-activity',
  },

  // Files
  FILES: {
    UPLOAD: '/upload',
    UPLOAD_BATCH: '/upload/batch',
    PROPERTY_FILES: (propertyId: string) => `/properties/${propertyId}/files`,
    RENOVATION_FILES: (renovationId: string) => `/renovations/${renovationId}/files`,
    DELETE: (fileId: string) => `/uploads/${fileId}`,
    REFRESH_URL: (fileId: string) => `/uploads/${fileId}/refresh-url`,
  },

  // Zillow Integration
  ZILLOW: {
    SEARCH: '/zillow/search',
    PROPERTY_DETAILS: '/zillow/property-details',
    IMPORT: '/zillow/import',
    REFRESH: (propertyId: string) => `/zillow/refresh/${propertyId}`,
    USAGE: '/zillow/usage',
  },

  // Integrations
  INTEGRATIONS: {
    LIST: '/api/integrations',
    CONNECT: (service: string) => `/api/integrations/${service}/connect`,
    DISCONNECT: (service: string) => `/api/integrations/${service}/disconnect`,
    TEST: (service: string) => `/api/integrations/${service}/test`,
  },

  // Reports
  REPORTS: {
    PORTFOLIO: '/api/reports/portfolio',
    PROPERTY: (propertyId: string) => `/api/reports/property/${propertyId}`,
    PORTFOLIO_EXPORT: '/api/reports/portfolio/export',
    PROPERTY_EXPORT: (propertyId: string) => `/api/reports/property/${propertyId}/export`,
  },

  // User Account
  USER: {
    ME: '/api/user/me',
    UPDATE_PROFILE: '/api/user/me',
    PREFERENCES: '/api/user/preferences',
    UPDATE_PREFERENCES: '/api/user/preferences',
    EXPORT_DATA: '/api/user/export-data',
    DELETE_ACCOUNT: '/api/user/delete-account',
  },

  // Health
  HEALTH: '/health',
};

export default API_ENDPOINTS;
