/**
 * Report Generation Service
 * Generates portfolio and property reports in JSON, CSV, and PDF formats
 */

import { prisma } from '@/db/prisma';
import { NotFoundError } from '@/utils/errors';
import { calculateNOI, calculateCapRate, calculateROI } from '@/calculations/financials';

export interface PortfolioReport {
  user: {
    id: string;
    email: string;
    name: string;
  };
  summary: {
    totalProperties: number;
    totalInvested: number;
    totalValue: number;
    averageCapRate: number;
    totalMonthlyNOI: number;
  };
  properties: PropertyReportItem[];
  generatedAt: Date;
}

export interface PropertyReportItem {
  id: string;
  address: string;
  city: string;
  state: string;
  type: string;
  purchasePrice: number;
  currentValue: number;
  status: string;
  scenarios: {
    name: string;
    exitStrategy: string;
    capRate?: number;
    roi?: number;
    totalProfit?: number;
  }[];
}

export interface PropertyDetailReport {
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    type: string;
    status: string;
    purchasePrice: number;
    currentValue: number;
    arv: number;
    sqft?: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  scenarios: Array<{
    id: string;
    name: string;
    exitStrategy: string;
    capRate?: number;
    cashOnCash?: number;
    roi?: number;
    monthlyNOI?: number;
    totalProfit?: number;
  }>;
  renovations: Array<{
    id: string;
    category: string;
    description: string;
    estimatedCost: number;
    actualCost?: number;
    status: string;
  }>;
  comps: Array<{
    address: string;
    salePrice: number;
    pricePerSqft: number;
    saleDate: Date;
    beds: number;
    baths: number;
    sqft: number;
  }>;
  files: Array<{
    id: string;
    originalName: string;
    size: number;
    createdAt: Date;
  }>;
  generatedAt: Date;
}

export class ReportService {
  /**
   * Generate portfolio report for user
   */
  async generatePortfolioReport(userId: string): Promise<PortfolioReport> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const properties = await prisma.property.findMany({
      where: { userId },
      include: {
        scenarios: true,
      },
    });

    // Calculate summary metrics
    const totalInvested = properties.reduce((sum, p) => sum + p.purchasePrice, 0);
    const totalValue = properties.reduce((sum, p) => sum + p.currentValue, 0);

    // Calculate cap rates and NOI
    let totalMonthlyNOI = 0;
    let totalCapRate = 0;
    let capRateCount = 0;

    const propertyItems: PropertyReportItem[] = properties.map((property) => {
      const scenarios = property.scenarios.map((scenario) => {
        if (scenario.capRate && scenario.capRate > 0) {
          totalCapRate += scenario.capRate;
          capRateCount++;
        }
        if (scenario.monthlyNOI) {
          totalMonthlyNOI += scenario.monthlyNOI;
        }

        return {
          name: scenario.name,
          exitStrategy: scenario.exitStrategy,
          capRate: scenario.capRate || undefined,
          roi: scenario.roi || undefined,
          totalProfit: scenario.totalProfit || undefined,
        };
      });

      return {
        id: property.id,
        address: property.address,
        city: property.city,
        state: property.state,
        type: property.type,
        purchasePrice: property.purchasePrice,
        currentValue: property.currentValue,
        status: property.status,
        scenarios,
      };
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      summary: {
        totalProperties: properties.length,
        totalInvested,
        totalValue,
        averageCapRate: capRateCount > 0 ? totalCapRate / capRateCount : 0,
        totalMonthlyNOI,
      },
      properties: propertyItems,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate detailed report for single property
   */
  async generatePropertyReport(userId: string, propertyId: string): Promise<PropertyDetailReport> {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, userId },
      include: {
        scenarios: true,
        renovations: true,
        comps: true,
        fileUploads: true,
      },
    });

    if (!property) {
      throw new NotFoundError('Property');
    }

    return {
      property: {
        id: property.id,
        address: property.address,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        type: property.type,
        status: property.status,
        purchasePrice: property.purchasePrice,
        currentValue: property.currentValue,
        arv: property.arv,
        sqft: property.sqft || undefined,
        bedrooms: property.bedrooms || undefined,
        bathrooms: property.bathrooms || undefined,
        yearBuilt: property.yearBuilt || undefined,
        notes: property.notes || undefined,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      },
      scenarios: property.scenarios.map((s) => ({
        id: s.id,
        name: s.name,
        exitStrategy: s.exitStrategy,
        capRate: s.capRate || undefined,
        cashOnCash: s.cashOnCash || undefined,
        roi: s.roi || undefined,
        monthlyNOI: s.monthlyNOI || undefined,
        totalProfit: s.totalProfit || undefined,
      })),
      renovations: property.renovations.map((r) => ({
        id: r.id,
        category: r.category,
        description: r.description,
        estimatedCost: r.estimatedCost,
        actualCost: r.actualCost || undefined,
        status: r.status,
      })),
      comps: property.comps.map((c) => ({
        address: c.address,
        salePrice: c.salePrice,
        pricePerSqft: c.pricePerSqft,
        saleDate: c.saleDate,
        beds: c.beds,
        baths: c.baths,
        sqft: c.sqft,
      })),
      files: property.fileUploads.map((f) => ({
        id: f.id,
        originalName: f.originalName,
        size: f.size,
        createdAt: f.createdAt,
      })),
      generatedAt: new Date(),
    };
  }

  /**
   * Convert report to CSV format
   */
  convertToCSV(report: PortfolioReport | PropertyDetailReport): string {
    if ('properties' in report) {
      // Portfolio report
      const rows: string[] = [];
      rows.push('PropertyPilot Portfolio Report');
      rows.push(`Generated: ${report.generatedAt.toISOString()}`);
      rows.push('');
      rows.push('Summary');
      rows.push(
        `Total Properties,Total Invested,Total Value,Average Cap Rate,Monthly NOI`
      );
      rows.push(
        `${report.summary.totalProperties},${report.summary.totalInvested},${report.summary.totalValue},${report.summary.averageCapRate.toFixed(2)}%,${report.summary.totalMonthlyNOI.toFixed(2)}`
      );
      rows.push('');
      rows.push('Properties');
      rows.push(
        `Address,City,State,Type,Purchase Price,Current Value,Status`
      );

      for (const prop of report.properties) {
        rows.push(
          `"${prop.address}",${prop.city},${prop.state},${prop.type},${prop.purchasePrice},${prop.currentValue},${prop.status}`
        );
      }

      return rows.join('\n');
    } else {
      // Property detail report
      const rows: string[] = [];
      rows.push('PropertyPilot Property Report');
      rows.push(`Generated: ${report.generatedAt.toISOString()}`);
      rows.push('');
      rows.push('Property Details');
      rows.push(
        `Address,City,State,ZIP,Type,Status,Purchase Price,Current Value,ARV`
      );
      rows.push(
        `"${report.property.address}",${report.property.city},${report.property.state},${report.property.zipCode},${report.property.type},${report.property.status},${report.property.purchasePrice},${report.property.currentValue},${report.property.arv}`
      );
      rows.push('');
      rows.push('Scenarios');
      rows.push('Name,Strategy,Cap Rate,ROI,Monthly NOI,Total Profit');

      for (const scenario of report.scenarios) {
        rows.push(
          `${scenario.name},${scenario.exitStrategy},${scenario.capRate?.toFixed(2) || 'N/A'},${scenario.roi?.toFixed(2) || 'N/A'},${scenario.monthlyNOI?.toFixed(2) || 'N/A'},${scenario.totalProfit?.toFixed(2) || 'N/A'}`
        );
      }

      return rows.join('\n');
    }
  }

  /**
   * Convert report to JSON (with pretty printing for export)
   */
  convertToJSON(report: PortfolioReport | PropertyDetailReport): string {
    return JSON.stringify(report, null, 2);
  }
}

export const reportService = new ReportService();
