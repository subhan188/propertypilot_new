import {
  calculateNOI,
  calculateCapRate,
  calculateCashOnCash,
  calculateROI,
  calculateFlipProfit,
  mortgageAmortizationSchedule,
  estimateARV,
  calculateCAGR,
  calculateBreakEvenMonths,
  calculateIRR,
  calculateNPV,
  sensitivityAnalysis,
} from './financials';

describe('Financial Calculations', () => {
  // ============= NOI TESTS =============
  describe('calculateNOI', () => {
    it('should calculate NOI for a rental property', () => {
      const noi = calculateNOI(2000, 90, 500);
      // (2000 × 0.90) × 12 - (500 × 12) = 21,600 - 6,000 = 15,600
      expect(noi).toBe(15600);
    });

    it('should calculate NOI with 100% occupancy', () => {
      const noi = calculateNOI(2000, 100, 500);
      expect(noi).toBe(24000 - 6000); // 18,000
    });

    it('should calculate NOI with zero expenses', () => {
      const noi = calculateNOI(2000, 90, 0);
      expect(noi).toBe(21600);
    });

    it('should handle 0% occupancy', () => {
      const noi = calculateNOI(2000, 0, 500);
      expect(noi).toBe(-6000);
    });

    it('should throw error on negative rent', () => {
      expect(() => calculateNOI(-2000, 90, 500)).toThrow();
    });

    it('should throw error on negative occupancy', () => {
      expect(() => calculateNOI(2000, -10, 500)).toThrow();
    });
  });

  // ============= CAP RATE TESTS =============
  describe('calculateCapRate', () => {
    it('should calculate cap rate correctly', () => {
      const capRate = calculateCapRate(18000, 300000);
      expect(capRate).toBe(6); // 18,000 / 300,000 = 6%
    });

    it('should handle zero NOI', () => {
      const capRate = calculateCapRate(0, 300000);
      expect(capRate).toBe(0);
    });

    it('should handle negative NOI (loss)', () => {
      const capRate = calculateCapRate(-10000, 300000);
      expect(capRate).toBeCloseTo(-3.33, 1);
    });

    it('should throw error on zero purchase price', () => {
      expect(() => calculateCapRate(18000, 0)).toThrow();
    });

    it('should throw error on negative purchase price', () => {
      expect(() => calculateCapRate(18000, -300000)).toThrow();
    });
  });

  // ============= CASH ON CASH TESTS =============
  describe('calculateCashOnCash', () => {
    it('should calculate cash on cash return', () => {
      const coc = calculateCashOnCash(1500, 60000); // Monthly NOI, down payment
      // (1500 × 12) / 60,000 × 100 = 30%
      expect(coc).toBe(30);
    });

    it('should handle zero monthly NOI', () => {
      const coc = calculateCashOnCash(0, 60000);
      expect(coc).toBe(0);
    });

    it('should handle negative monthly NOI', () => {
      const coc = calculateCashOnCash(-500, 60000);
      expect(coc).toBeCloseTo(-10, 1);
    });

    it('should throw error on zero down payment', () => {
      expect(() => calculateCashOnCash(1500, 0)).toThrow();
    });
  });

  // ============= ROI TESTS =============
  describe('calculateROI', () => {
    it('should calculate ROI correctly', () => {
      const roi = calculateROI(100000, 500000);
      expect(roi).toBe(20); // 100,000 / 500,000 = 20%
    });

    it('should handle zero profit', () => {
      const roi = calculateROI(0, 500000);
      expect(roi).toBe(0);
    });

    it('should handle negative profit (loss)', () => {
      const roi = calculateROI(-50000, 500000);
      expect(roi).toBe(-10);
    });

    it('should throw error on zero investment', () => {
      expect(() => calculateROI(100000, 0)).toThrow();
    });
  });

  // ============= FLIP PROFIT TESTS =============
  describe('calculateFlipProfit', () => {
    it('should calculate flip profit correctly', () => {
      const profit = calculateFlipProfit(
        300000, // purchase
        50000, // rehab
        10000, // closing
        450000, // sale
        20000 // selling
      );
      // 450,000 - (300,000 + 50,000 + 10,000 + 20,000) = 70,000
      expect(profit).toBe(70000);
    });

    it('should account for holding costs', () => {
      const profit = calculateFlipProfit(
        300000,
        50000,
        10000,
        450000,
        20000,
        5000 // holding
      );
      // 450,000 - (300,000 + 50,000 + 10,000 + 5,000 + 20,000) = 65,000
      expect(profit).toBe(65000);
    });

    it('should handle loss scenario', () => {
      const profit = calculateFlipProfit(
        300000,
        100000,
        20000,
        350000,
        30000
      );
      // 350,000 - (300,000 + 100,000 + 20,000 + 30,000) = -100,000
      expect(profit).toBe(-100000);
    });
  });

  // ============= AMORTIZATION TESTS =============
  describe('mortgageAmortizationSchedule', () => {
    it('should generate 30-year amortization schedule', () => {
      const schedule = mortgageAmortizationSchedule(300000, 7, 360); // 7% over 30 years
      expect(schedule.length).toBe(360);
      expect(schedule[0].month).toBe(1);
      expect(schedule[359].month).toBe(360);
    });

    it('should calculate correct first month interest', () => {
      const schedule = mortgageAmortizationSchedule(300000, 7, 360);
      const firstMonth = schedule[0];
      const expectedInterest = (300000 * 0.07) / 12;
      expect(firstMonth.interest).toBeCloseTo(expectedInterest, 0);
    });

    it('should have final balance near zero', () => {
      const schedule = mortgageAmortizationSchedule(300000, 7, 360);
      const finalBalance = schedule[359].balance;
      expect(finalBalance).toBeLessThan(1); // Allow for floating point errors
    });

    it('should have consistent monthly payment', () => {
      const schedule = mortgageAmortizationSchedule(300000, 7, 360);
      const monthlyPayment = schedule[0].payment;
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].payment).toBeCloseTo(monthlyPayment, 2);
      }
    });

    it('should throw error on negative principal', () => {
      expect(() => mortgageAmortizationSchedule(-300000, 7, 360)).toThrow();
    });

    it('should throw error on zero months', () => {
      expect(() => mortgageAmortizationSchedule(300000, 7, 0)).toThrow();
    });

    it('should handle short-term loans', () => {
      const schedule = mortgageAmortizationSchedule(100000, 5, 60); // 5 years
      expect(schedule.length).toBe(60);
      expect(schedule[59].balance).toBeLessThan(1);
    });

    it('should handle zero interest rate', () => {
      const schedule = mortgageAmortizationSchedule(100000, 0, 60);
      // With 0% interest, payment = principal / months
      expect(schedule[0].payment).toBeCloseTo(100000 / 60, 0);
    });
  });

  // ============= ARV ESTIMATION TESTS =============
  describe('estimateARV', () => {
    it('should estimate ARV using median comp price per sqft', () => {
      const comparables = [
        { salePrice: 300000, sqft: 2000 }, // $150/sqft
        { salePrice: 350000, sqft: 2100 }, // $166.67/sqft
        { salePrice: 400000, sqft: 2400 }, // $166.67/sqft
      ];
      const arv = estimateARV(comparables, 2000);
      // Median is $166.67, so ARV = $166.67 × 2000 = $333,333
      expect(arv).toBeCloseTo(333333, 0);
    });

    it('should handle single comparable', () => {
      const comparables = [{ salePrice: 300000, sqft: 2000 }];
      const arv = estimateARV(comparables, 2000);
      expect(arv).toBe(300000);
    });

    it('should throw error on empty comparables', () => {
      expect(() => estimateARV([], 2000)).toThrow();
    });

    it('should throw error on zero property sqft', () => {
      const comparables = [{ salePrice: 300000, sqft: 2000 }];
      expect(() => estimateARV(comparables, 0)).toThrow();
    });
  });

  // ============= CAGR TESTS =============
  describe('calculateCAGR', () => {
    it('should calculate CAGR correctly', () => {
      const cagr = calculateCAGR(1000, 1610.51, 5);
      // (1610.51 / 1000)^(1/5) - 1 ≈ 0.10 = 10%
      expect(cagr).toBeCloseTo(10, 1);
    });

    it('should handle decline (negative CAGR)', () => {
      const cagr = calculateCAGR(1000, 500, 5);
      expect(cagr).toBeLessThan(0);
    });

    it('should handle no growth', () => {
      const cagr = calculateCAGR(1000, 1000, 5);
      expect(cagr).toBeCloseTo(0, 5);
    });

    it('should throw error on negative begin value', () => {
      expect(() => calculateCAGR(-1000, 1610.51, 5)).toThrow();
    });

    it('should throw error on zero years', () => {
      expect(() => calculateCAGR(1000, 1610.51, 0)).toThrow();
    });
  });

  // ============= BREAK-EVEN TESTS =============
  describe('calculateBreakEvenMonths', () => {
    it('should calculate break-even for profitable property', () => {
      const months = calculateBreakEvenMonths(1000, 60000);
      expect(months).toBe(60); // 60,000 / 1,000 = 60 months
    });

    it('should return infinity for positive NOI with zero investment', () => {
      const months = calculateBreakEvenMonths(1000, 0);
      expect(months).toBe(0);
    });

    it('should return infinity for zero NOI', () => {
      const months = calculateBreakEvenMonths(0, 60000);
      expect(months).toBe(Infinity);
    });

    it('should return negative infinity for negative NOI', () => {
      const months = calculateBreakEvenMonths(-1000, 60000);
      expect(months).toBe(-Infinity);
    });

    it('should handle small investments', () => {
      const months = calculateBreakEvenMonths(1000, 100);
      expect(months).toBe(0.1); // 100 / 1,000 = 0.1 months
    });
  });

  // ============= IRR TESTS =============
  describe('calculateIRR', () => {
    it('should calculate IRR for simple investment', () => {
      // Initial investment: -100, then cash flows: +50, +50, +50
      // IRR should be approximately 23.4%
      const irr = calculateIRR([50, 50, 50], 100);
      expect(irr).toBeCloseTo(23.4, 1);
    });

    it('should calculate IRR for real estate scenario', () => {
      // Investment: 300,000, year 1-5: +30,000/year, then sell for +250,000
      const cashFlows = [30000, 30000, 30000, 30000, 280000];
      const irr = calculateIRR(cashFlows, 300000);
      expect(irr).toBeGreaterThan(0);
      expect(irr).toBeLessThan(30);
    });

    it('should throw error on empty cash flows', () => {
      expect(() => calculateIRR([], 100000)).toThrow();
    });
  });

  // ============= NPV TESTS =============
  describe('calculateNPV', () => {
    it('should calculate NPV with positive cash flows', () => {
      // Initial: -100, CF: +50/year for 5 years, discount: 10%
      const npv = calculateNPV([50, 50, 50, 50, 50], 100, 10);
      expect(npv).toBeGreaterThan(0);
    });

    it('should calculate NPV with zero discount rate', () => {
      // Initial: -100, CF: +50 × 3 = +150, NPV = +50
      const npv = calculateNPV([50, 50, 50], 100, 0);
      expect(npv).toBe(50);
    });

    it('should calculate negative NPV for poor investment', () => {
      // Initial: -100, CF: +10/year for 5 years, discount: 15%
      const npv = calculateNPV([10, 10, 10, 10, 10], 100, 15);
      expect(npv).toBeLessThan(0);
    });

    it('should throw error on empty cash flows', () => {
      expect(() => calculateNPV([], 100, 10)).toThrow();
    });
  });

  // ============= SENSITIVITY ANALYSIS TESTS =============
  describe('sensitivityAnalysis', () => {
    it('should perform sensitivity analysis', () => {
      const baseCase = {
        purchasePrice: 300000,
        rehabCost: 50000,
        closingCosts: 10000,
        salePrice: 450000,
        sellingCosts: 20000,
      };
      const analysis = sensitivityAnalysis(baseCase, 10);

      expect(analysis.baseProfit).toBe(70000);
      expect(analysis.scenarios.length).toBe(3);

      // Verify sale price scenario
      const salePriceScenario = analysis.scenarios.find(
        (s) => s.variable === 'salePrice'
      );
      expect(salePriceScenario).toBeDefined();
      expect(salePriceScenario!.downPercent).toBeLessThan(analysis.baseProfit);
      expect(salePriceScenario!.upPercent).toBeGreaterThan(analysis.baseProfit);
    });

    it('should show impact of 20% variation', () => {
      const baseCase = {
        purchasePrice: 300000,
        rehabCost: 50000,
        closingCosts: 10000,
        salePrice: 450000,
        sellingCosts: 20000,
      };
      const analysis = sensitivityAnalysis(baseCase, 20);

      // With 20% variation, impact should be larger
      const salePriceScenario = analysis.scenarios.find(
        (s) => s.variable === 'salePrice'
      );
      const baseProfitDifference = Math.abs(
        salePriceScenario!.upPercent - salePriceScenario!.downPercent
      );
      expect(baseProfitDifference).toBeGreaterThan(40000); // 20% of 450k
    });
  });

  // ============= EDGE CASE TESTS =============
  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      const roi = calculateROI(1000000000, 5000000000);
      expect(roi).toBe(20);
    });

    it('should handle very small numbers', () => {
      const roi = calculateROI(0.01, 0.5);
      expect(roi).toBe(2);
    });

    it('should handle mixed positive and negative cash flows for IRR', () => {
      // Typical real estate: negative initial, positive during hold, positive at exit
      const irr = calculateIRR([50000, 50000, 50000, 350000], 300000);
      expect(irr).toBeGreaterThan(0);
    });
  });

  // ============= INTEGRATION TESTS =============
  describe('Integration - Combined Calculations', () => {
    it('should calculate metrics for a rental property', () => {
      // Property details
      const monthlyRent = 2000;
      const occupancyRate = 90;
      const monthlyExpenses = 500;
      const purchasePrice = 300000;
      const downPayment = 60000;

      // Calculate metrics
      const noi = calculateNOI(monthlyRent, occupancyRate, monthlyExpenses);
      const monthlyNOI = noi / 12;
      const capRate = calculateCapRate(noi, purchasePrice);
      const cashOnCash = calculateCashOnCash(monthlyNOI, downPayment);

      expect(noi).toBe(15600);
      expect(capRate).toBe(5.2);
      expect(cashOnCash).toBe(26);
    });

    it('should calculate metrics for a flip property', () => {
      const purchasePrice = 300000;
      const rehabCost = 50000;
      const closingCosts = 10000;
      const salePrice = 450000;
      const sellingCosts = 20000;
      const holdingCosts = 5000;

      const profit = calculateFlipProfit(
        purchasePrice,
        rehabCost,
        closingCosts,
        salePrice,
        sellingCosts,
        holdingCosts
      );

      const totalInvestment =
        purchasePrice + rehabCost + closingCosts + holdingCosts;
      const roi = calculateROI(profit, totalInvestment);

      expect(profit).toBe(65000);
      expect(roi).toBeCloseTo(17.81, 1);
    });

    it('should calculate amortization for a 30-year mortgage', () => {
      const loanAmount = 300000;
      const interestRate = 7;
      const months = 360;

      const schedule = mortgageAmortizationSchedule(
        loanAmount,
        interestRate,
        months
      );

      const totalInterestPaid = schedule.reduce(
        (sum, entry) => sum + entry.interest,
        0
      );
      const totalPaid = loanAmount + totalInterestPaid;

      // For a 7% 30-year mortgage on $300k, total paid should be around $718.5k
      expect(totalPaid).toBeCloseTo(718500, -2);
    });
  });
});
