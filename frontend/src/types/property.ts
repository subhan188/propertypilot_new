// PropertyPilot Type Definitions

export type PropertyType = 'rent' | 'airbnb' | 'flip';
export type PropertyStatus = 'lead' | 'analyzing' | 'offer' | 'under_contract' | 'owned' | 'sold';
export type RenovationStatus = 'pending' | 'in_progress' | 'completed';

export interface Property {
  id: string;
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
  photos: string[];
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface DealScenario {
  id: string;
  propertyId: string;
  name: string;
  purchasePrice: number;
  rehabCost: number;
  holdingCosts: number;
  closingCosts: number;
  interestRate: number;
  holdTimeMonths: number;
  exitStrategy: PropertyType;
  // Rental specific
  monthlyRent?: number;
  occupancyRate?: number;
  // Airbnb specific
  dailyRate?: number;
  averageOccupancy?: number;
  // Flip specific
  salePrice?: number;
  sellingCosts?: number;
  // Calculated
  capRate: number;
  cashOnCash: number;
  roi: number;
  monthlyNOI: number;
  totalProfit: number;
  createdAt: string;
}

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
  photos: string[];
  notes: string;
}

export interface PipelineColumn {
  id: PropertyStatus;
  title: string;
  color: string;
  properties: Property[];
}

export interface KPIData {
  portfolioValue: number;
  portfolioValueChange: number;
  monthlyCashflow: number;
  cashflowChange: number;
  availableEquity: number;
  equityChange: number;
  totalProperties: number;
  activeDeals: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  propertyId?: string;
  createdAt: string;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: 'USD' | 'EUR' | 'GBP';
  timezone: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
