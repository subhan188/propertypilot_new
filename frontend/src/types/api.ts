/**
 * Type definitions for all API responses
 */

// Common types
export type PropertyType = 'rent' | 'airbnb' | 'flip';
export type PropertyStatus = 'lead' | 'analyzing' | 'offer' | 'under_contract' | 'owned' | 'sold';
export type RenovationStatus = 'pending' | 'in_progress' | 'completed';
export type ExitStrategy = 'rent' | 'airbnb' | 'flip';
export type AlertType = 'info' | 'warning' | 'success' | 'error';

// User
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
  timezone: string;
  propertyTypes: PropertyType[];
  propertyStatuses: PropertyStatus[];
}

// Property
export interface Property {
  id: string;
  userId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: PropertyType;
  status: PropertyStatus;
  purchasePrice: number;
  currentValue: number;
  arv: number; // After Repair Value
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  lotSize: number;
  latitude: number;
  longitude: number;
  zpid?: string; // Zillow property ID
  zestimate?: number;
  rentZestimate?: number;
  taxAssessment?: number;
  favorite: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastFetched?: string;
}

// Deal Scenario
export interface DealScenario {
  id: string;
  propertyId: string;
  name: string;
  purchasePrice: number;
  rehabCost: number;
  holdingCosts: number;
  closingCosts: number;
  exitStrategy: ExitStrategy;
  interestRate: number;
  holdTimeMonths: number;

  // Rental-specific
  monthlyRent?: number;
  occupancyRate?: number;

  // Airbnb-specific
  dailyRate?: number;
  averageOccupancy?: number;

  // Flip-specific
  salePrice?: number;
  sellingCosts?: number;

  // Calculated metrics
  capRate?: number;
  cashOnCash?: number;
  roi?: number;
  monthlyNOI?: number;
  totalProfit?: number;
  irr?: number;
  npv?: number;

  createdAt: string;
  updatedAt: string;
}

// Renovation Item
export interface RenovationItem {
  id: string;
  propertyId: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost?: number;
  contractor?: string;
  startDate?: string;
  endDate?: string;
  status: RenovationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Alert
export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  propertyId?: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

// File Upload
export interface FileUpload {
  id: string;
  propertyId?: string;
  renovationId?: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  signedUrl: string;
  signedUrlExpiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard
export interface KPIData {
  portfolioValue: number;
  portfolioValueChange: number;
  monthlyCashflow: number;
  cashflowChange: number;
  availableEquity: number;
  equityChange: number;
  propertyCount: number;
  averageCapRate: number;
}

export interface PortfolioTrendPoint {
  date: string;
  value: number;
}

export interface DealFlow {
  lead: number;
  analyzing: number;
  offer: number;
  under_contract: number;
  owned: number;
  sold: number;
}

export interface PropertyTypeBreakdown {
  type: PropertyType;
  count: number;
  totalValue: number;
  averageValue: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  propertyId?: string;
  timestamp: string;
}

// Analysis
export interface AnalysisResult {
  scenario: DealScenario;
  metrics: {
    noi: number;
    capRate: number;
    cashOnCash: number;
    roi: number;
    irr: number;
    npv: number;
    monthlyProfit: number;
    breakEvenMonths: number;
  };
}

export interface MortgageScheduleEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface MortgageSchedule {
  principal: number;
  annualRate: number;
  months: number;
  monthlyPayment: number;
  totalInterest: number;
  schedule: MortgageScheduleEntry[];
}

export interface ScenarioComparison {
  scenarios: DealScenario[];
  ranking: Array<{
    scenarioId: string;
    name: string;
    roi: number;
    totalProfit: number;
    cashOnCash: number;
    rank: number;
  }>;
}

export interface SensitivityAnalysis {
  baseCase: DealScenario;
  variations: Array<{
    variable: 'purchasePrice' | 'rehabCost' | 'salePrice';
    change: number; // percentage
    roi: number;
    totalProfit: number;
    capRate: number;
  }>;
}

// Zillow
export interface ZillowSearchParams {
  keyword?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minSqft?: number;
  maxSqft?: number;
  limit?: number;
}

export interface ZillowProperty {
  zpid: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  zestimate: number;
  rentZestimate: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  latitude: number;
  longitude: number;
  photos: string[];
  zillowUrl: string;
  status: string;
}

export interface ZillowUsage {
  used: number;
  limit: number;
  percentageUsed: number;
  resetDate: string;
}

// Integration
export interface Integration {
  id: string;
  userId: string;
  service: 'zillow' | 'airdna' | 'mls' | 'stripe';
  isActive: boolean;
  lastSyncAt?: string;
  syncStatus?: 'success' | 'failed' | 'pending';
}

// Report
export interface PropertyReport {
  property: Property;
  scenarios: DealScenario[];
  renovations: RenovationItem[];
  comps: any[];
  totalInvestation: number;
  currentValue: number;
  unrealizedGain: number;
}

export interface PortfolioReport {
  totalProperties: number;
  totalValue: number;
  totalInvestment: number;
  averageROI: number;
  averageCapRate: number;
  propertyBreakdown: PropertyTypeBreakdown[];
  topProperties: Property[];
}

export default {};
