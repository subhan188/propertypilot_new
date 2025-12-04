import { z } from 'zod';

// Auth schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// Property schemas
export const PropertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'Valid zip code required'),
  type: z.enum(['rent', 'airbnb', 'flip']),
  status: z.enum(['lead', 'analyzing', 'offer', 'under_contract', 'owned', 'sold']),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  currentValue: z.number().positive('Current value must be positive'),
  arv: z.number().positive('ARV must be positive'),
  sqft: z.number().positive('Square footage must be positive'),
  bedrooms: z.number().int().positive(),
  bathrooms: z.number().positive(),
  yearBuilt: z.number().int(),
  lotSize: z.number().positive(),
  latitude: z.number(),
  longitude: z.number(),
  notes: z.string().optional(),
});

export const UpdatePropertySchema = PropertySchema.partial();

// Deal Scenario schemas
export const DealScenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name is required'),
  purchasePrice: z.number().positive(),
  rehabCost: z.number().nonnegative(),
  holdingCosts: z.number().nonnegative(),
  closingCosts: z.number().nonnegative(),
  interestRate: z.number().nonnegative().max(100),
  holdTimeMonths: z.number().int().positive(),
  exitStrategy: z.enum(['rent', 'airbnb', 'flip']),
  monthlyRent: z.number().positive().optional(),
  occupancyRate: z.number().min(0).max(100).optional(),
  dailyRate: z.number().positive().optional(),
  averageOccupancy: z.number().min(0).max(100).optional(),
  salePrice: z.number().positive().optional(),
  sellingCosts: z.number().nonnegative().optional(),
});

export const UpdateDealScenarioSchema = DealScenarioSchema.partial();

// Renovation schemas
export const RenovationItemSchema = z.object({
  category: z.string().min(1),
  description: z.string().min(1),
  estimatedCost: z.number().positive(),
  actualCost: z.number().positive().optional(),
  contractor: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  notes: z.string().optional(),
});

export const UpdateRenovationItemSchema = RenovationItemSchema.partial();

// User preferences schemas
export const UserPreferencesSchema = z.object({
  currency: z.string().optional(),
  timezone: z.string().optional(),
  propertyTypes: z.array(z.enum(['rent', 'airbnb', 'flip'])).optional(),
  propertyStatuses: z.array(z.string()).optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type PropertyInput = z.infer<typeof PropertySchema>;
export type DealScenarioInput = z.infer<typeof DealScenarioSchema>;
export type RenovationItemInput = z.infer<typeof RenovationItemSchema>;
export type UserPreferencesInput = z.infer<typeof UserPreferencesSchema>;
