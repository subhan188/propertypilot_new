/**
 * Report Generation Service
 * Generates portfolio and property reports in JSON, CSV, and PDF formats
 */
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
export declare class ReportService {
    /**
     * Generate portfolio report for user
     */
    generatePortfolioReport(userId: string): Promise<PortfolioReport>;
    /**
     * Generate detailed report for single property
     */
    generatePropertyReport(userId: string, propertyId: string): Promise<PropertyDetailReport>;
    /**
     * Convert report to CSV format
     */
    convertToCSV(report: PortfolioReport | PropertyDetailReport): string;
    /**
     * Convert report to JSON (with pretty printing for export)
     */
    convertToJSON(report: PortfolioReport | PropertyDetailReport): string;
}
export declare const reportService: ReportService;
//# sourceMappingURL=reportService.d.ts.map