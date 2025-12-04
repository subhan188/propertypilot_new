export declare class DashboardService {
    getKPI(userId: string): Promise<{
        portfolioValue: number;
        portfolioValueChange: number;
        monthlyCashflow: number;
        cashflowChange: number;
        availableEquity: number;
        equityChange: number;
        totalProperties: number;
        activeDeals: number;
    }>;
    getPortfolioTrend(userId: string, days?: number): Promise<{
        date: string;
        value: number;
        change: number;
    }[]>;
    getDealFlow(userId: string): Promise<{
        leads: number;
        analyzing: number;
        offers: number;
        under_contract: number;
        owned: number;
        sold: number;
    }>;
    getPropertyTypes(userId: string): Promise<{
        rent: {
            count: number;
            value: number;
        };
        airbnb: {
            count: number;
            value: number;
        };
        flip: {
            count: number;
            value: number;
        };
    }>;
    getRecentActivity(userId: string, limit?: number): Promise<{
        type: string;
        name: any;
        timestamp: any;
    }[]>;
}
export declare const dashboardService: DashboardService;
//# sourceMappingURL=dashboardService.d.ts.map