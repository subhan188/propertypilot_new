import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@/db/prisma';
import {
  calculateNOI,
  calculateCapRate,
  calculateCashOnCash,
  calculateROI,
  calculateFlipProfit,
  calculateIRR,
  calculateNPV,
  mortgageAmortizationSchedule,
} from '@/calculations/financials';
import { NotFoundError, ValidationError } from '@/utils/errors';

async function analyzeScenarioHandler(
  request: FastifyRequest<{ Params: { scenarioId: string } }>,
  reply: FastifyReply
) {
  const userId = request.session.userId;
  const { scenarioId } = request.params;
  const data = request.body as any;

  try {
    // Verify scenario exists and belongs to user
    const scenario = await prisma.dealScenario.findUnique({
      where: { id: scenarioId },
      include: { property: { select: { userId: true } } },
    });

    if (!scenario || scenario.property.userId !== userId) {
      throw new NotFoundError('Scenario');
    }

    // Calculate metrics based on exit strategy
    const calculations = calculateScenarioMetrics(scenario, data);

    // Update scenario with calculated values
    const updated = await prisma.dealScenario.update({
      where: { id: scenarioId },
      data: {
        capRate: calculations.capRate,
        cashOnCash: calculations.cashOnCash,
        roi: calculations.roi,
        monthlyNOI: calculations.monthlyNOI,
        totalProfit: calculations.totalProfit,
        irr: calculations.irr,
        npv: calculations.npv,
      },
    });

    return reply.send({
      success: true,
      data: {
        scenario: updated,
        analysis: {
          strategy: scenario.exitStrategy,
          calculations,
          assumptions: {
            monthlyRent: scenario.monthlyRent,
            occupancyRate: scenario.occupancyRate,
            purchasePrice: scenario.purchasePrice,
            rehabCost: scenario.rehabCost,
            salePrice: scenario.salePrice,
            holdTimeMonths: scenario.holdTimeMonths,
            interestRate: scenario.interestRate,
          },
        },
      },
    });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return reply.code(404).send({
        success: false,
        error: error.message,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to analyze scenario',
    });
  }
}

async function mortgageScheduleHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  const body = request.body as any;
  const { principal, annualRate, months } = body;

  try {
    if (!principal || !annualRate || !months) {
      throw new ValidationError({
        principal: 'Principal is required',
        annualRate: 'Annual rate is required',
        months: 'Months is required',
      });
    }

    const schedule = mortgageAmortizationSchedule(principal, annualRate, months);

    const totalInterest = schedule.reduce((sum, entry) => sum + entry.interest, 0);

    return reply.send({
      success: true,
      data: {
        schedule,
        summary: {
          principal,
          totalInterest,
          totalPaid: principal + totalInterest,
          months,
          monthlyPayment: schedule[0].payment,
        },
      },
    });
  } catch (error: any) {
    if (error.message.includes('must be')) {
      return reply.code(400).send({
        success: false,
        error: error.message,
      });
    }

    reply.server.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Failed to calculate amortization',
    });
  }
}

async function compareScenariosHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  const body = request.body as any;
  const { scenarios } = body;

  try {
    if (!scenarios || !Array.isArray(scenarios)) {
      throw new ValidationError({
        scenarios: 'Array of scenarios is required',
      });
    }

    const comparisons = scenarios.map((scenario: any) => {
      const calculations = calculateScenarioMetrics(scenario, {});
      return {
        name: scenario.name,
        strategy: scenario.exitStrategy,
        ...calculations,
      };
    });

    // Rank by ROI
    const ranked = comparisons.sort((a, b) => b.roi - a.roi);

    return reply.send({
      success: true,
      data: {
        comparisons: ranked,
        best: {
          byROI: ranked[0],
          byCapRate: comparisons.sort((a, b) => b.capRate - a.capRate)[0],
          byProfit: comparisons.sort((a, b) => b.totalProfit - a.totalProfit)[0],
        },
      },
    });
  } catch (error: any) {
    reply.server.log.error(error);
    return reply.code(400).send({
      success: false,
      error: error.message,
    });
  }
}

export async function analysisRoutes(fastify: FastifyInstance) {
  fastify.post<{ Params: { scenarioId: string } }>(
    '/scenarios/:scenarioId/analyze',
    analyzeScenarioHandler
  );

  fastify.post<{ Body: any }>(
    '/analysis/mortgage-schedule',
    mortgageScheduleHandler
  );

  fastify.post<{ Body: any }>(
    '/analysis/compare-scenarios',
    compareScenariosHandler
  );
}

/**
 * Calculate financial metrics for a scenario
 */
function calculateScenarioMetrics(
  scenario: any,
  data: any
): {
  capRate: number;
  cashOnCash: number;
  roi: number;
  monthlyNOI: number;
  totalProfit: number;
  irr: number;
  npv: number;
} {
  const strategy = scenario.exitStrategy || data.exitStrategy;

  let capRate = 0;
  let cashOnCash = 0;
  let roi = 0;
  let monthlyNOI = 0;
  let totalProfit = 0;
  let irr = 0;
  let npv = 0;

  if (strategy === 'flip') {
    // Flip calculation
    totalProfit = calculateFlipProfit(
      scenario.purchasePrice,
      scenario.rehabCost,
      scenario.closingCosts,
      scenario.salePrice || 0,
      scenario.sellingCosts || 0,
      scenario.holdingCosts || 0
    );

    roi = calculateROI(
      totalProfit,
      scenario.purchasePrice +
        scenario.rehabCost +
        scenario.closingCosts +
        (scenario.holdingCosts || 0)
    );

    // IRR for flip: lump sum at end
    const cashFlows = [totalProfit];
    try {
      irr = calculateIRR(
        cashFlows,
        scenario.purchasePrice +
          scenario.rehabCost +
          scenario.closingCosts +
          (scenario.holdingCosts || 0)
      );
    } catch {
      irr = 0;
    }

    // NPV calculation
    const discountRate = scenario.interestRate || 10;
    try {
      npv = calculateNPV(cashFlows, scenario.purchasePrice, discountRate);
    } catch {
      npv = 0;
    }
  } else if (strategy === 'rent') {
    // Rental calculation
    const expenses =
      (scenario.monthlyExpenses || 0) + (scenario.maintenanceCost || 0);
    monthlyNOI = calculateNOI(
      scenario.monthlyRent || 0,
      scenario.occupancyRate || 100,
      expenses
    ) / 12;

    const annualNOI = monthlyNOI * 12;
    capRate = calculateCapRate(annualNOI, scenario.purchasePrice);

    const downPayment = scenario.purchasePrice * (1 - (scenario.ltv || 0.75) / 100);
    cashOnCash = calculateCashOnCash(monthlyNOI, downPayment);

    // IRR: monthly cash flows
    const monthlyPayment =
      (scenario.interestRate || 7) > 0
        ? monthlyNOI * 0.8 // Conservative: 80% available
        : monthlyNOI;

    const cashFlows = Array(12 * (scenario.holdTimeMonths || 5)).fill(
      monthlyPayment
    );

    try {
      irr = calculateIRR(cashFlows, downPayment);
    } catch {
      irr = 0;
    }

    try {
      npv = calculateNPV(cashFlows, downPayment, scenario.interestRate || 10);
    } catch {
      npv = 0;
    }

    totalProfit = annualNOI * ((scenario.holdTimeMonths || 60) / 12);
  } else if (strategy === 'airbnb') {
    // Airbnb calculation (similar to rental but with daily rates)
    const dailyRate = scenario.dailyRate || 150;
    const daysPerYear = (scenario.averageOccupancy || 70) * 3.65; // occupancy % × days
    const annualGrossIncome = dailyRate * daysPerYear;

    // AirBnB fees typically 3-5%
    const fees = annualGrossIncome * 0.04;
    const expenses =
      (scenario.monthlyExpenses || 0) + (scenario.cleaningCost || 0);
    const monthlyNOI_calc = (annualGrossIncome - fees - expenses * 12) / 12;

    monthlyNOI = monthlyNOI_calc;

    const annualNOI = monthlyNOI * 12;
    capRate = calculateCapRate(annualNOI, scenario.purchasePrice);

    const downPayment =
      scenario.purchasePrice * (1 - (scenario.ltv || 0.75) / 100);
    cashOnCash = calculateCashOnCash(monthlyNOI, downPayment);

    totalProfit = annualNOI * ((scenario.holdTimeMonths || 60) / 12);
  }

  return {
    capRate: Math.round(capRate * 100) / 100,
    cashOnCash: Math.round(cashOnCash * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    monthlyNOI: Math.round(monthlyNOI * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    irr: Math.round(irr * 100) / 100,
    npv: Math.round(npv * 100) / 100,
  };
}
