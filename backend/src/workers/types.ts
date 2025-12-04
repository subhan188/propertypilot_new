/**
 * Job types and interfaces for BullMQ worker queue
 */

export enum JobType {
  REFRESH_PROPERTY_COMPS = 'refresh-property-comps',
  SYNC_AIRDNA_DATA = 'sync-airdna-data',
  GENERATE_DAILY_ALERTS = 'generate-daily-alerts',
  GENERATE_REPORT = 'generate-report',
}

/**
 * Refresh Property Comps Job Data
 * Updates comparable sales data for properties
 */
export interface RefreshPropertyCompsJobData {
  propertyId: string;
  userId: string;
  radius?: number; // miles around property
}

/**
 * Sync AirBnb Data Job Data
 * Synchronizes AirBnB market data for properties
 */
export interface SyncAirbnbDataJobData {
  propertyId: string;
  userId: string;
  city: string;
  state: string;
}

/**
 * Generate Daily Alerts Job Data
 * Creates alerts for user properties based on market conditions
 */
export interface GenerateDailyAlertsJobData {
  userId: string;
}

/**
 * Generate Report Job Data
 * Generates PDF/CSV reports for properties
 */
export interface GenerateReportJobData {
  propertyId: string;
  userId: string;
  format: 'pdf' | 'csv';
}

/**
 * Job result interface
 */
export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  processedAt: Date;
}
