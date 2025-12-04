/**
 * Pure financial calculation functions for real estate investment analysis
 * All functions are deterministic and have no side effects
 */

// ============= BASIC CALCULATIONS =============

/**
 * Calculate Net Operating Income (NOI) for rental/Airbnb properties
 * NOI = (Monthly Rent × Occupancy Rate) - Operating Expenses
 * @param monthlyRent - Monthly rental income
 * @param occupancyRate - Occupancy percentage (0-100)
 * @param monthlyExpenses - Monthly operating expenses
 * @returns Annual NOI in dollars
 */
export function calculateNOI(
  monthlyRent: number,
  occupancyRate: number,
  monthlyExpenses: number = 0
): number {
  if (monthlyRent < 0 || occupancyRate < 0 || monthlyExpenses < 0) {
    throw new Error('Values must be non-negative');
  }

  const occupancyRate_decimal = occupancyRate / 100;
  const annualGrossIncome = monthlyRent * 12 * occupancyRate_decimal;
  const annualExpenses = monthlyExpenses * 12;

  return annualGrossIncome - annualExpenses;
}

/**
 * Calculate Cap Rate (Capitalization Rate)
 * Cap Rate = NOI / Purchase Price × 100
 * @param noi - Net Operating Income
 * @param purchasePrice - Property purchase price
 * @returns Cap rate as percentage (0-100)
 */
export function calculateCapRate(noi: number, purchasePrice: number): number {
  if (purchasePrice <= 0) {
    throw new Error('Purchase price must be positive');
  }

  return (noi / purchasePrice) * 100;
}

/**
 * Calculate Cash on Cash Return
 * Cash on Cash = Annual Cash Flow / Cash Invested × 100
 * @param monthlyNOI - Monthly net operating income
 * @param downPayment - Cash invested as down payment
 * @returns Cash on cash return as percentage
 */
export function calculateCashOnCash(
  monthlyNOI: number,
  downPayment: number
): number {
  if (downPayment <= 0) {
    throw new Error('Down payment must be positive');
  }

  const annualCashFlow = monthlyNOI * 12;
  return (annualCashFlow / downPayment) * 100;
}

/**
 * Calculate ROI for a property investment
 * ROI = (Total Profit / Total Invested) × 100
 * @param totalProfit - Total profit from the investment
 * @param totalInvested - Total amount invested (down payment + rehab + etc)
 * @returns ROI as percentage
 */
export function calculateROI(
  totalProfit: number,
  totalInvested: number
): number {
  if (totalInvested <= 0) {
    throw new Error('Total invested must be positive');
  }

  return (totalProfit / totalInvested) * 100;
}

// ============= FLIP-SPECIFIC CALCULATIONS =============

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
export function calculateFlipProfit(
  purchasePrice: number,
  rehabCost: number,
  closingCosts: number,
  salePrice: number,
  sellingCosts: number,
  holdingCosts: number = 0
): number {
  const totalInvested =
    purchasePrice + rehabCost + closingCosts + holdingCosts;
  const totalCosts = totalInvested + sellingCosts;

  return salePrice - totalCosts;
}

// ============= AMORTIZATION & MORTGAGES =============

/**
 * Generate mortgage amortization schedule
 * @param principal - Loan amount
 * @param annualRate - Annual interest rate (as percentage, e.g., 7.5)
 * @param months - Loan duration in months
 * @returns Array of amortization entries
 */
export function mortgageAmortizationSchedule(
  principal: number,
  annualRate: number,
  months: number
): Array<{
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}> {
  if (principal <= 0 || months <= 0) {
    throw new Error('Principal and months must be positive');
  }

  const monthlyRate = annualRate / 100 / 12;

  // Handle zero interest rate case
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    monthlyPayment =
      principal *
      ((monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1));
  }

  const schedule = [];
  let remainingBalance = principal;

  for (let month = 1; month <= months; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;

    // Avoid floating point errors causing negative balance
    if (remainingBalance < 0) {
      remainingBalance = 0;
    }

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: remainingBalance,
    });
  }

  return schedule;
}

// ============= VALUATION =============

/**
 * Estimate After Repair Value (ARV) from comparable sales
 * Uses median price per sqft from comparables
 * @param comparables - Array of {salePrice, sqft}
 * @param propertySquareFeet - Subject property square footage
 * @returns Estimated ARV in dollars
 */
export function estimateARV(
  comparables: Array<{ salePrice: number; sqft: number }>,
  propertySquareFeet: number
): number {
  if (!comparables || comparables.length === 0) {
    throw new Error('At least one comparable is required');
  }

  if (propertySquareFeet <= 0) {
    throw new Error('Property square feet must be positive');
  }

  // Calculate price per sqft for each comparable
  const pricePerSqftList = comparables
    .map((comp) => comp.salePrice / comp.sqft)
    .sort((a, b) => a - b);

  // Use median price per sqft
  const medianIndex = Math.floor(pricePerSqftList.length / 2);
  const medianPricePerSqft =
    pricePerSqftList.length % 2 === 0
      ? (pricePerSqftList[medianIndex - 1] +
          pricePerSqftList[medianIndex]) /
        2
      : pricePerSqftList[medianIndex];

  return medianPricePerSqft * propertySquareFeet;
}

// ============= GROWTH METRICS =============

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 * CAGR = (Ending Value / Beginning Value)^(1/Years) - 1
 * @param beginValue - Starting value
 * @param endValue - Ending value
 * @param years - Number of years
 * @returns CAGR as percentage (can be negative)
 */
export function calculateCAGR(
  beginValue: number,
  endValue: number,
  years: number
): number {
  if (beginValue <= 0 || years <= 0) {
    throw new Error('Begin value and years must be positive');
  }

  const cagr = Math.pow(endValue / beginValue, 1 / years) - 1;
  return cagr * 100;
}

/**
 * Calculate break-even months for a rental property
 * @param monthlyNOI - Monthly net operating income
 * @param initialInvestment - Total initial investment
 * @returns Months until break-even (Infinity if will never break even, -Infinity if already broke even)
 */
export function calculateBreakEvenMonths(
  monthlyNOI: number,
  initialInvestment: number
): number {
  if (monthlyNOI === 0) {
    return Infinity; // Will never break even with zero NOI
  }

  if (monthlyNOI < 0) {
    return -Infinity; // Already losing money
  }

  return initialInvestment / monthlyNOI;
}

// ============= ADVANCED METRICS =============

/**
 * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
 * Solves: NPV = 0, where NPV = Σ(CF_t / (1 + r)^t) - Initial Investment
 * @param cashFlows - Array of cash flows by period (index 0 is immediate, 1+ are future)
 * @param initialInvestment - Initial investment amount
 * @returns IRR as percentage
 */
export function calculateIRR(
  cashFlows: number[],
  initialInvestment: number
): number {
  if (!cashFlows || cashFlows.length === 0) {
    throw new Error('At least one cash flow is required');
  }

  // Build the cash flow array with initial investment as negative
  const allCashFlows = [-initialInvestment, ...cashFlows];

  // Newton-Raphson method to find IRR
  let rate = 0.1; // Start with 10% guess
  const maxIterations = 100;
  const tolerance = 0.0001;

  for (let i = 0; i < maxIterations; i++) {
    // Calculate NPV and its derivative
    let npv = 0;
    let npvDerivative = 0;

    for (let t = 0; t < allCashFlows.length; t++) {
      const discountFactor = Math.pow(1 + rate, t);
      npv += allCashFlows[t] / discountFactor;
      npvDerivative -= (t * allCashFlows[t]) / Math.pow(1 + rate, t + 1);
    }

    // Newton-Raphson update
    const rateChange = npv / npvDerivative;
    rate -= rateChange;

    // Check for convergence
    if (Math.abs(rateChange) < tolerance) {
      break;
    }
  }

  return rate * 100;
}

/**
 * Calculate Net Present Value (NPV)
 * NPV = Σ(CF_t / (1 + r)^t) - Initial Investment
 * @param cashFlows - Array of annual cash flows
 * @param initialInvestment - Initial investment amount
 * @param discountRate - Discount rate as percentage (e.g., 10 for 10%)
 * @returns NPV in dollars
 */
export function calculateNPV(
  cashFlows: number[],
  initialInvestment: number,
  discountRate: number
): number {
  if (!cashFlows || cashFlows.length === 0) {
    throw new Error('At least one cash flow is required');
  }

  const discountRate_decimal = discountRate / 100;
  let npv = -initialInvestment;

  for (let t = 0; t < cashFlows.length; t++) {
    const discountFactor = Math.pow(1 + discountRate_decimal, t + 1);
    npv += cashFlows[t] / discountFactor;
  }

  return npv;
}

/**
 * Perform sensitivity analysis on a property investment
 * Shows how profit changes with variations in key assumptions
 * @param baseCase - Base case metrics
 * @param variationPercent - Percentage variation to test (e.g., 10 for ±10%)
 * @returns Sensitivity analysis results
 */
export function sensitivityAnalysis(
  baseCase: {
    salePrice: number;
    purchasePrice: number;
    rehabCost: number;
    closingCosts: number;
    sellingCosts: number;
  },
  variationPercent: number = 10
): {
  baseProfit: number;
  scenarios: Array<{
    variable: string;
    downPercent: number;
    upPercent: number;
  }>;
} {
  const baseProfit = calculateFlipProfit(
    baseCase.purchasePrice,
    baseCase.rehabCost,
    baseCase.closingCosts,
    baseCase.salePrice,
    baseCase.sellingCosts
  );

  const variation = variationPercent / 100;

  const scenarios = [
    {
      variable: 'salePrice',
      downPercent: calculateFlipProfit(
        baseCase.purchasePrice,
        baseCase.rehabCost,
        baseCase.closingCosts,
        baseCase.salePrice * (1 - variation),
        baseCase.sellingCosts
      ),
      upPercent: calculateFlipProfit(
        baseCase.purchasePrice,
        baseCase.rehabCost,
        baseCase.closingCosts,
        baseCase.salePrice * (1 + variation),
        baseCase.sellingCosts
      ),
    },
    {
      variable: 'rehabCost',
      downPercent: calculateFlipProfit(
        baseCase.purchasePrice,
        baseCase.rehabCost * (1 - variation),
        baseCase.closingCosts,
        baseCase.salePrice,
        baseCase.sellingCosts
      ),
      upPercent: calculateFlipProfit(
        baseCase.purchasePrice,
        baseCase.rehabCost * (1 + variation),
        baseCase.closingCosts,
        baseCase.salePrice,
        baseCase.sellingCosts
      ),
    },
    {
      variable: 'purchasePrice',
      downPercent: calculateFlipProfit(
        baseCase.purchasePrice * (1 - variation),
        baseCase.rehabCost,
        baseCase.closingCosts,
        baseCase.salePrice,
        baseCase.sellingCosts
      ),
      upPercent: calculateFlipProfit(
        baseCase.purchasePrice * (1 + variation),
        baseCase.rehabCost,
        baseCase.closingCosts,
        baseCase.salePrice,
        baseCase.sellingCosts
      ),
    },
  ];

  return { baseProfit, scenarios };
}
