/**
 * Pure financial calculation functions for real estate investment analysis
 * All functions are deterministic and have no side effects
 */
/**
 * Calculate Net Operating Income (NOI) for rental/Airbnb properties
 * NOI = (Monthly Rent × Occupancy Rate) - Operating Expenses
 * @param monthlyRent - Monthly rental income
 * @param occupancyRate - Occupancy percentage (0-100)
 * @param monthlyExpenses - Monthly operating expenses
 * @returns Annual NOI in dollars
 */
export declare function calculateNOI(monthlyRent: number, occupancyRate: number, monthlyExpenses?: number): number;
/**
 * Calculate Cap Rate (Capitalization Rate)
 * Cap Rate = NOI / Purchase Price × 100
 * @param noi - Net Operating Income
 * @param purchasePrice - Property purchase price
 * @returns Cap rate as percentage (0-100)
 */
export declare function calculateCapRate(noi: number, purchasePrice: number): number;
/**
 * Calculate Cash on Cash Return
 * Cash on Cash = Annual Cash Flow / Cash Invested × 100
 * @param monthlyNOI - Monthly net operating income
 * @param downPayment - Cash invested as down payment
 * @returns Cash on cash return as percentage
 */
export declare function calculateCashOnCash(monthlyNOI: number, downPayment: number): number;
/**
 * Calculate ROI for a property investment
 * ROI = (Total Profit / Total Invested) × 100
 * @param totalProfit - Total profit from the investment
 * @param totalInvested - Total amount invested (down payment + rehab + etc)
 * @returns ROI as percentage
 */
export declare function calculateROI(totalProfit: number, totalInvested: number): number;
/**
 * Calculate total profit from a flip
 * Profit = Sale Price - Purchase Price - Rehab - Closing Costs - Selling Costs - Holding Costs
 * @param purchasePrice - Original purchase price
 * @param rehabCost - Cost of renovations
 * @param closingCosts - Closing costs on purchase
 * @param salePrice - Sale price
 * @param sellingCosts - Selling costs (realtor commission, etc)
 * @param holdingCosts - Total carrying costs
 * @returns Total profit in dollars
 */
export declare function calculateFlipProfit(purchasePrice: number, rehabCost: number, closingCosts: number, salePrice: number, sellingCosts: number, holdingCosts?: number): number;
/**
 * Generate mortgage amortization schedule
 * @param principal - Loan amount
 * @param annualRate - Annual interest rate (as percentage, e.g., 7.5)
 * @param months - Loan duration in months
 * @returns Array of amortization entries
 */
export declare function mortgageAmortizationSchedule(principal: number, annualRate: number, months: number): Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
}>;
/**
 * Estimate After Repair Value (ARV) from comparable sales
 * Uses median price per sqft from comparables
 * @param comparables - Array of {salePrice, sqft}
 * @param propertySquareFeet - Subject property square footage
 * @returns Estimated ARV in dollars
 */
export declare function estimateARV(comparables: Array<{
    salePrice: number;
    sqft: number;
}>, propertySquareFeet: number): number;
/**
 * Calculate Compound Annual Growth Rate (CAGR)
 * CAGR = (Ending Value / Beginning Value)^(1/Years) - 1
 * @param beginValue - Starting value
 * @param endValue - Ending value
 * @param years - Number of years
 * @returns CAGR as percentage (can be negative)
 */
export declare function calculateCAGR(beginValue: number, endValue: number, years: number): number;
/**
 * Calculate break-even months for a rental property
 * @param monthlyNOI - Monthly net operating income
 * @param initialInvestment - Total initial investment
 * @returns Months until break-even (Infinity if will never break even, -Infinity if already broke even)
 */
export declare function calculateBreakEvenMonths(monthlyNOI: number, initialInvestment: number): number;
/**
 * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
 * Solves: NPV = 0, where NPV = Σ(CF_t / (1 + r)^t) - Initial Investment
 * @param cashFlows - Array of cash flows by period (index 0 is immediate, 1+ are future)
 * @param initialInvestment - Initial investment amount
 * @returns IRR as percentage
 */
export declare function calculateIRR(cashFlows: number[], initialInvestment: number): number;
/**
 * Calculate Net Present Value (NPV)
 * NPV = Σ(CF_t / (1 + r)^t) - Initial Investment
 * @param cashFlows - Array of annual cash flows
 * @param initialInvestment - Initial investment amount
 * @param discountRate - Discount rate as percentage (e.g., 10 for 10%)
 * @returns NPV in dollars
 */
export declare function calculateNPV(cashFlows: number[], initialInvestment: number, discountRate: number): number;
/**
 * Perform sensitivity analysis on a property investment
 * Shows how profit changes with variations in key assumptions
 * @param baseCase - Base case metrics
 * @param variationPercent - Percentage variation to test (e.g., 10 for ±10%)
 * @returns Sensitivity analysis results
 */
export declare function sensitivityAnalysis(baseCase: {
    salePrice: number;
    purchasePrice: number;
    rehabCost: number;
    closingCosts: number;
    sellingCosts: number;
}, variationPercent?: number): {
    baseProfit: number;
    scenarios: Array<{
        variable: string;
        downPercent: number;
        upPercent: number;
    }>;
};
//# sourceMappingURL=financials.d.ts.map