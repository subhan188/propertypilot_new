import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Home,
  Zap,
  AlertCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Analysis = () => {
  // ============= NOI Calculator State =============
  const [noiInputs, setNoiInputs] = useState({
    monthlyRent: 2500,
    occupancyRate: 95,
    monthlyExpenses: 800,
  });

  // ============= Cap Rate Calculator State =============
  const [capRateInputs, setCapRateInputs] = useState({
    noi: 30000,
    purchasePrice: 300000,
  });

  // ============= Cash on Cash Return State =============
  const [coccInputs, setCoccInputs] = useState({
    monthlyNOI: 2500,
    downPayment: 60000,
  });

  // ============= ROI Calculator State =============
  const [roiInputs, setRoiInputs] = useState({
    totalProfit: 50000,
    totalInvested: 100000,
  });

  // ============= Flip Profit Calculator State =============
  const [flipInputs, setFlipInputs] = useState({
    purchasePrice: 250000,
    rehabCost: 50000,
    closingCosts: 7500,
    salePrice: 400000,
    sellingCosts: 20000,
    holdingCosts: 5000,
  });

  // ============= IRR Calculator State =============
  const [irrInputs, setIrrInputs] = useState({
    initialInvestment: 100000,
    year1: 20000,
    year2: 25000,
    year3: 30000,
    year4: 35000,
    year5: 150000,
  });

  // ============= NPV Calculator State =============
  const [npvInputs, setNpvInputs] = useState({
    initialInvestment: 100000,
    discountRate: 12,
    year1: 20000,
    year2: 25000,
    year3: 30000,
    year4: 35000,
    year5: 150000,
  });

  // ============= Mortgage Inputs =============
  const [mortgageInputs, setMortgageInputs] = useState({
    principal: 250000,
    annualRate: 6.5,
    years: 30,
  });

  // ============= Sensitivity Analysis State =============
  const [sensitivityInputs, setSensitivityInputs] = useState({
    purchasePrice: 250000,
    rehabCost: 50000,
    closingCosts: 7500,
    salePrice: 400000,
    sellingCosts: 20000,
    variation: 10,
  });

  // ============= ARV Calculator State =============
  const [arvInputs, setArvInputs] = useState({
    propertySquareFeet: 2000,
    comp1Sale: 400000,
    comp1Sqft: 2100,
    comp2Sale: 380000,
    comp2Sqft: 1900,
    comp3Sale: 420000,
    comp3Sqft: 2200,
  });

  // ============= CAGR Calculator State =============
  const [cagrInputs, setCAgrInputs] = useState({
    beginValue: 100000,
    endValue: 300000,
    years: 5,
  });

  // ============= Break Even Calculator State =============
  const [breakEvenInputs, setBreakEvenInputs] = useState({
    monthlyNOI: 2500,
    initialInvestment: 100000,
  });

  // ============= Calculations =============

  const calculateNOI = () => {
    const occupancyDecimal = noiInputs.occupancyRate / 100;
    const annualGrossIncome = noiInputs.monthlyRent * 12 * occupancyDecimal;
    const annualExpenses = noiInputs.monthlyExpenses * 12;
    return annualGrossIncome - annualExpenses;
  };

  const calculateCapRate = () => {
    const noi = calculateNOI();
    return (noi / capRateInputs.purchasePrice) * 100;
  };

  const calculateCashOnCash = () => {
    const annualCashFlow = coccInputs.monthlyNOI * 12;
    return (annualCashFlow / coccInputs.downPayment) * 100;
  };

  const calculateROI = () => {
    return (roiInputs.totalProfit / roiInputs.totalInvested) * 100;
  };

  const calculateFlipProfit = () => {
    const totalInvested =
      flipInputs.purchasePrice +
      flipInputs.rehabCost +
      flipInputs.closingCosts +
      flipInputs.holdingCosts;
    const totalCosts = totalInvested + flipInputs.sellingCosts;
    return flipInputs.salePrice - totalCosts;
  };

  const calculateMortgagePayment = () => {
    const monthlyRate = flipInputs.purchasePrice / 100 / 12;
    const months = mortgageInputs.years * 12;
    const monthlyPayment =
      mortgageInputs.principal *
      ((monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1));
    return monthlyPayment;
  };

  const generateMortgageSchedule = () => {
    const monthlyRate = mortgageInputs.annualRate / 100 / 12;
    const months = mortgageInputs.years * 12;
    let monthlyPayment = mortgageInputs.principal / months;
    if (monthlyRate !== 0) {
      monthlyPayment =
        mortgageInputs.principal *
        ((monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1));
    }

    const schedule = [];
    let balance = mortgageInputs.principal;

    for (let i = 1; i <= months; i += 12) {
      // Show yearly summary
      let yearBalance = balance;
      let yearInterest = 0;
      let yearPrincipal = 0;

      for (let j = 0; j < 12 && i + j <= months; j++) {
        const interestPayment = yearBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        yearBalance -= principalPayment;
        yearInterest += interestPayment;
        yearPrincipal += principalPayment;
      }

      schedule.push({
        year: Math.ceil(i / 12),
        payment: monthlyPayment * 12,
        principal: yearPrincipal,
        interest: yearInterest,
        balance: Math.max(0, yearBalance),
      });

      balance = Math.max(0, yearBalance);
    }

    return schedule;
  };

  const calculateCAGR = () => {
    if (cagrInputs.beginValue <= 0 || cagrInputs.years <= 0) return 0;
    const cagr =
      Math.pow(cagrInputs.endValue / cagrInputs.beginValue, 1 / cagrInputs.years) - 1;
    return cagr * 100;
  };

  const calculateBreakEven = () => {
    if (breakEvenInputs.monthlyNOI === 0) return Infinity;
    if (breakEvenInputs.monthlyNOI < 0) return -Infinity;
    return breakEvenInputs.initialInvestment / breakEvenInputs.monthlyNOI;
  };

  const generateSensitivityData = () => {
    const variation = sensitivityInputs.variation / 100;
    const baseProfit =
      sensitivityInputs.salePrice -
      (sensitivityInputs.purchasePrice +
        sensitivityInputs.rehabCost +
        sensitivityInputs.closingCosts +
        sensitivityInputs.sellingCosts);

    const variations = [-20, -10, 0, 10, 20];
    const data = [];

    variations.forEach((v) => {
      const variationDecimal = v / 100;

      // Sale Price variation
      const salePriceProfit =
        sensitivityInputs.salePrice * (1 + variationDecimal) -
        (sensitivityInputs.purchasePrice +
          sensitivityInputs.rehabCost +
          sensitivityInputs.closingCosts +
          sensitivityInputs.sellingCosts);

      // Rehab Cost variation
      const rehabProfit =
        sensitivityInputs.salePrice -
        (sensitivityInputs.purchasePrice +
          sensitivityInputs.rehabCost * (1 + variationDecimal) +
          sensitivityInputs.closingCosts +
          sensitivityInputs.sellingCosts);

      // Purchase Price variation
      const purchaseProfit =
        sensitivityInputs.salePrice -
        (sensitivityInputs.purchasePrice * (1 + variationDecimal) +
          sensitivityInputs.rehabCost +
          sensitivityInputs.closingCosts +
          sensitivityInputs.sellingCosts);

      data.push({
        variation: `${v > 0 ? "+" : ""}${v}%`,
        salePrice: salePriceProfit,
        rehabCost: rehabProfit,
        purchasePrice: purchaseProfit,
      });
    });

    return data;
  };

  const estimateARV = () => {
    const comps = [
      { salePrice: arvInputs.comp1Sale, sqft: arvInputs.comp1Sqft },
      { salePrice: arvInputs.comp2Sale, sqft: arvInputs.comp2Sqft },
      { salePrice: arvInputs.comp3Sale, sqft: arvInputs.comp3Sqft },
    ];

    const pricesPerSqft = comps
      .map((c) => c.salePrice / c.sqft)
      .sort((a, b) => a - b);

    const medianIndex = Math.floor(pricesPerSqft.length / 2);
    const medianPrice =
      pricesPerSqft.length % 2 === 0
        ? (pricesPerSqft[medianIndex - 1] + pricesPerSqft[medianIndex]) / 2
        : pricesPerSqft[medianIndex];

    return medianPrice * arvInputs.propertySquareFeet;
  };

  const mortgageSchedule = generateMortgageSchedule();
  const sensitivityData = generateSensitivityData();
  const noi = calculateNOI();
  const capRate = calculateCapRate();
  const coc = calculateCashOnCash();
  const roi = calculateROI();
  const flipProfit = calculateFlipProfit();
  const cagr = calculateCAGR();
  const breakEven = calculateBreakEven();
  const arv = estimateARV();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Analysis</h1>
            <p className="text-muted-foreground">Complete suite of real estate investment analysis tools</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Tabs defaultValue="noi" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 mb-6">
              <TabsTrigger value="noi" className="text-xs sm:text-sm">NOI</TabsTrigger>
              <TabsTrigger value="caprate" className="text-xs sm:text-sm">Cap Rate</TabsTrigger>
              <TabsTrigger value="coc" className="text-xs sm:text-sm">CoC</TabsTrigger>
              <TabsTrigger value="roi" className="text-xs sm:text-sm">ROI</TabsTrigger>
              <TabsTrigger value="flip" className="text-xs sm:text-sm">Flip</TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs sm:text-sm">Advanced</TabsTrigger>
            </TabsList>

            {/* ============= NOI TAB ============= */}
            <TabsContent value="noi" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Net Operating Income (NOI)
                  </CardTitle>
                  <CardDescription>
                    NOI = (Monthly Rent × Occupancy Rate × 12) - Annual Operating Expenses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Monthly Rent</Label>
                      <Input
                        type="number"
                        value={noiInputs.monthlyRent}
                        onChange={(e) =>
                          setNoiInputs({
                            ...noiInputs,
                            monthlyRent: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Occupancy Rate (%)</Label>
                      <Input
                        type="number"
                        value={noiInputs.occupancyRate}
                        onChange={(e) =>
                          setNoiInputs({
                            ...noiInputs,
                            occupancyRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Monthly Expenses</Label>
                      <Input
                        type="number"
                        value={noiInputs.monthlyExpenses}
                        onChange={(e) =>
                          setNoiInputs({
                            ...noiInputs,
                            monthlyExpenses: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Card className="bg-accent/10 border-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Annual NOI:</span>
                        <span className="text-3xl font-bold text-accent">{formatCurrency(noi)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Monthly NOI: {formatCurrency(noi / 12)}
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============= CAP RATE TAB ============= */}
            <TabsContent value="caprate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Capitalization Rate (Cap Rate)
                  </CardTitle>
                  <CardDescription>
                    Cap Rate = (NOI / Purchase Price) × 100 - Indicates annual yield
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Purchase Price</Label>
                      <Input
                        type="number"
                        value={capRateInputs.purchasePrice}
                        onChange={(e) =>
                          setCapRateInputs({
                            ...capRateInputs,
                            purchasePrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Annual NOI (from above)</Label>
                      <div className="mt-2 p-2 bg-muted rounded border">
                        {formatCurrency(noi)}
                      </div>
                    </div>
                  </div>

                  <Card className="bg-accent/10 border-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Cap Rate:</span>
                        <span className="text-3xl font-bold text-accent">{formatPercent(capRate)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Rule of Thumb: 6-10% is typical for good deals
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============= CASH ON CASH TAB ============= */}
            <TabsContent value="coc" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cash on Cash Return
                  </CardTitle>
                  <CardDescription>
                    Cash on Cash = (Annual Cash Flow / Cash Invested) × 100 - Return on actual cash down
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Monthly NOI</Label>
                      <Input
                        type="number"
                        value={coccInputs.monthlyNOI}
                        onChange={(e) =>
                          setCoccInputs({
                            ...coccInputs,
                            monthlyNOI: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Down Payment (Cash Invested)</Label>
                      <Input
                        type="number"
                        value={coccInputs.downPayment}
                        onChange={(e) =>
                          setCoccInputs({
                            ...coccInputs,
                            downPayment: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Card className="bg-accent/10 border-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Cash on Cash Return:</span>
                        <span className="text-3xl font-bold text-accent">{formatPercent(coc)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Annual Cash Flow: {formatCurrency(coccInputs.monthlyNOI * 12)}
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============= ROI TAB ============= */}
            <TabsContent value="roi" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Return on Investment (ROI)
                  </CardTitle>
                  <CardDescription>
                    ROI = (Total Profit / Total Invested) × 100 - Overall return on money invested
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Total Profit</Label>
                      <Input
                        type="number"
                        value={roiInputs.totalProfit}
                        onChange={(e) =>
                          setRoiInputs({
                            ...roiInputs,
                            totalProfit: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Total Invested</Label>
                      <Input
                        type="number"
                        value={roiInputs.totalInvested}
                        onChange={(e) =>
                          setRoiInputs({
                            ...roiInputs,
                            totalInvested: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Card className="bg-accent/10 border-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">ROI:</span>
                        <span className="text-3xl font-bold text-accent">{formatPercent(roi)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============= FLIP TAB ============= */}
            <TabsContent value="flip" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Flip Profit Calculator
                  </CardTitle>
                  <CardDescription>
                    Calculate total profit from a property flip including all costs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Purchase Price</Label>
                      <Input
                        type="number"
                        value={flipInputs.purchasePrice}
                        onChange={(e) =>
                          setFlipInputs({
                            ...flipInputs,
                            purchasePrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Rehab Cost</Label>
                      <Input
                        type="number"
                        value={flipInputs.rehabCost}
                        onChange={(e) =>
                          setFlipInputs({
                            ...flipInputs,
                            rehabCost: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Closing Costs</Label>
                      <Input
                        type="number"
                        value={flipInputs.closingCosts}
                        onChange={(e) =>
                          setFlipInputs({
                            ...flipInputs,
                            closingCosts: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Holding Costs</Label>
                      <Input
                        type="number"
                        value={flipInputs.holdingCosts}
                        onChange={(e) =>
                          setFlipInputs({
                            ...flipInputs,
                            holdingCosts: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Sale Price</Label>
                      <Input
                        type="number"
                        value={flipInputs.salePrice}
                        onChange={(e) =>
                          setFlipInputs({
                            ...flipInputs,
                            salePrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Selling Costs</Label>
                      <Input
                        type="number"
                        value={flipInputs.sellingCosts}
                        onChange={(e) =>
                          setFlipInputs({
                            ...flipInputs,
                            sellingCosts: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Card className="bg-accent/10 border-accent">
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Total Profit:</span>
                        <span className={cn(
                          "text-3xl font-bold",
                          flipProfit > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {formatCurrency(flipProfit)}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>Total Invested: {formatCurrency(
                          flipInputs.purchasePrice +
                          flipInputs.rehabCost +
                          flipInputs.closingCosts +
                          flipInputs.holdingCosts
                        )}</p>
                        <p>Total Sale: {formatCurrency(flipInputs.salePrice)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ============= ADVANCED TAB ============= */}
            <TabsContent value="advanced" className="space-y-4">
              {/* Mortgage Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle>Mortgage Amortization Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Loan Amount</Label>
                      <Input
                        type="number"
                        value={mortgageInputs.principal}
                        onChange={(e) =>
                          setMortgageInputs({
                            ...mortgageInputs,
                            principal: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Annual Interest Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={mortgageInputs.annualRate}
                        onChange={(e) =>
                          setMortgageInputs({
                            ...mortgageInputs,
                            annualRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Loan Term (Years)</Label>
                      <Input
                        type="number"
                        value={mortgageInputs.years}
                        onChange={(e) =>
                          setMortgageInputs({
                            ...mortgageInputs,
                            years: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mortgageSchedule}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="principal" fill="#3B82F6" name="Principal" />
                      <Bar dataKey="interest" fill="#EF4444" name="Interest" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sensitivity Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Sensitivity Analysis</CardTitle>
                  <CardDescription>How profit changes with variable adjustments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Sale Price</Label>
                      <Input
                        type="number"
                        value={sensitivityInputs.salePrice}
                        onChange={(e) =>
                          setSensitivityInputs({
                            ...sensitivityInputs,
                            salePrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Rehab Cost</Label>
                      <Input
                        type="number"
                        value={sensitivityInputs.rehabCost}
                        onChange={(e) =>
                          setSensitivityInputs({
                            ...sensitivityInputs,
                            rehabCost: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Variation (%)</Label>
                      <Input
                        type="number"
                        value={sensitivityInputs.variation}
                        onChange={(e) =>
                          setSensitivityInputs({
                            ...sensitivityInputs,
                            variation: parseFloat(e.target.value) || 10,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sensitivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="variation" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Line type="monotone" dataKey="salePrice" stroke="#3B82F6" name="Sale Price" />
                      <Line type="monotone" dataKey="rehabCost" stroke="#10B981" name="Rehab Cost" />
                      <Line type="monotone" dataKey="purchasePrice" stroke="#F59E0B" name="Purchase Price" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* ARV Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle>After Repair Value (ARV) Estimator</CardTitle>
                  <CardDescription>Estimate property value based on comparable sales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-4">
                    <Label>Property Square Feet</Label>
                    <Input
                      type="number"
                      value={arvInputs.propertySquareFeet}
                      onChange={(e) =>
                        setArvInputs({
                          ...arvInputs,
                          propertySquareFeet: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i}>
                        <Label>Comparable {i}</Label>
                        <div className="mt-2 space-y-2">
                          <Input
                            placeholder="Sale Price"
                            type="number"
                            value={arvInputs[`comp${i}Sale` as keyof typeof arvInputs] as number}
                            onChange={(e) =>
                              setArvInputs({
                                ...arvInputs,
                                [`comp${i}Sale`]: parseFloat(e.target.value) || 0,
                              } as any)
                            }
                          />
                          <Input
                            placeholder="Square Feet"
                            type="number"
                            value={arvInputs[`comp${i}Sqft` as keyof typeof arvInputs] as number}
                            onChange={(e) =>
                              setArvInputs({
                                ...arvInputs,
                                [`comp${i}Sqft`]: parseFloat(e.target.value) || 0,
                              } as any)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Card className="bg-accent/10 border-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Estimated ARV:</span>
                        <span className="text-3xl font-bold text-accent">{formatCurrency(arv)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* CAGR Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle>Compound Annual Growth Rate (CAGR)</CardTitle>
                  <CardDescription>Calculate long-term growth rate of your investment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Beginning Value</Label>
                      <Input
                        type="number"
                        value={cagrInputs.beginValue}
                        onChange={(e) =>
                          setCAgrInputs({
                            ...cagrInputs,
                            beginValue: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Ending Value</Label>
                      <Input
                        type="number"
                        value={cagrInputs.endValue}
                        onChange={(e) =>
                          setCAgrInputs({
                            ...cagrInputs,
                            endValue: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Number of Years</Label>
                      <Input
                        type="number"
                        value={cagrInputs.years}
                        onChange={(e) =>
                          setCAgrInputs({
                            ...cagrInputs,
                            years: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Card className="bg-accent/10 border-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">CAGR:</span>
                        <span className="text-3xl font-bold text-accent">{formatPercent(cagr)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Break Even Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle>Break Even Analysis</CardTitle>
                  <CardDescription>How many months until investment breaks even</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Monthly NOI</Label>
                      <Input
                        type="number"
                        value={breakEvenInputs.monthlyNOI}
                        onChange={(e) =>
                          setBreakEvenInputs({
                            ...breakEvenInputs,
                            monthlyNOI: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Initial Investment</Label>
                      <Input
                        type="number"
                        value={breakEvenInputs.initialInvestment}
                        onChange={(e) =>
                          setBreakEvenInputs({
                            ...breakEvenInputs,
                            initialInvestment: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Card className="bg-accent/10 border-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Break Even:</span>
                        <span className="text-3xl font-bold text-accent">
                          {breakEven === Infinity
                            ? "Never"
                            : breakEven === -Infinity
                            ? "Already broken"
                            : `${breakEven.toFixed(1)} months`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Analysis;
