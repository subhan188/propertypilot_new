import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { KPIData, PortfolioTrendPoint, DealFlow, PropertyTypeBreakdown } from "@/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Home,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const Dashboard = () => {
  const [kpi, setKpi] = useState<KPIData | null>(null);
  const [trends, setTrends] = useState<PortfolioTrendPoint[]>([]);
  const [dealFlow, setDealFlow] = useState<DealFlow | null>(null);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeBreakdown[]>([]);

  const { get: getKPI } = useApi<KPIData>(null);
  const { get: getTrends } = useApi<PortfolioTrendPoint[]>(null);
  const { get: getDealFlow } = useApi<DealFlow>(null);
  const { get: getPropertyTypes } = useApi<PropertyTypeBreakdown[]>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      // Try to load from API
      const kpiData = await getKPI("/dashboard/kpi");
      const trendData = await getTrends("/dashboard/portfolio-trend");
      const flowData = await getDealFlow("/dashboard/deal-flow");
      const typeData = await getPropertyTypes("/dashboard/property-types");

      // Use API data if available, otherwise use mock data
      if (kpiData) setKpi(kpiData);
      else {
        setKpi({
          portfolioValue: 2850000,
          portfolioValueChange: 125000,
          monthlyCashflow: 8500,
          cashflowChange: 1200,
          availableEquity: 450000,
          equityChange: 35000,
          propertyCount: 8,
          averageCapRate: 7.25,
        });
      }

      if (trendData) setTrends(trendData);
      else {
        setTrends([
          { date: "2025-11-01", value: 2400000 },
          { date: "2025-12-01", value: 2550000 },
          { date: "2025-01-01", value: 2650000 },
          { date: "2025-02-01", value: 2725000 },
          { date: "2025-03-01", value: 2850000 },
        ]);
      }

      if (flowData) setDealFlow(flowData);
      else {
        setDealFlow({
          lead: 3,
          analyzing: 2,
          offer: 1,
          under_contract: 1,
          owned: 8,
          sold: 2,
        });
      }

      if (typeData) setPropertyTypes(typeData);
      else {
        setPropertyTypes([
          { type: "rent", count: 4, totalValue: 1200000, averageValue: 300000 },
          { type: "airbnb", count: 2, totalValue: 850000, averageValue: 425000 },
          { type: "flip", count: 2, totalValue: 800000, averageValue: 400000 },
        ]);
      }
    };

    loadDashboard();
  }, [getKPI, getTrends, getDealFlow, getPropertyTypes]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const getChangeColor = (change: number) => {
    if (change === 0) return "text-muted-foreground";
    return change > 0 ? "text-success" : "text-destructive";
  };

  const getChangeIcon = (change: number) => {
    if (change === 0) return null;
    return change > 0 ? (
      <ArrowUpRight className="h-4 w-4" />
    ) : (
      <ArrowDownRight className="h-4 w-4" />
    );
  };

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
            <h1 className="text-2xl font-bold text-foreground">Portfolio Dashboard</h1>
            <p className="text-muted-foreground">Your real estate investment overview</p>
          </div>
          <Button className="btn-accent">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </motion.div>

        {/* KPI Cards */}
        {kpi && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Portfolio Value */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Home className="h-4 w-4 text-accent" />
                  Portfolio Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(kpi.portfolioValue)}</p>
                <p className={cn("text-xs mt-1 flex items-center gap-1", getChangeColor(kpi.portfolioValueChange))}>
                  {getChangeIcon(kpi.portfolioValueChange)}
                  {kpi.portfolioValueChange > 0 ? "+" : ""}
                  {formatCurrency(kpi.portfolioValueChange)}
                </p>
              </CardContent>
            </Card>

            {/* Monthly Cashflow */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  Monthly Cashflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(kpi.monthlyCashflow)}</p>
                <p className={cn("text-xs mt-1 flex items-center gap-1", getChangeColor(kpi.cashflowChange))}>
                  {getChangeIcon(kpi.cashflowChange)}
                  {kpi.cashflowChange > 0 ? "+" : ""}
                  {formatCurrency(kpi.cashflowChange)}
                </p>
              </CardContent>
            </Card>

            {/* Available Equity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  Available Equity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(kpi.availableEquity)}</p>
                <p className={cn("text-xs mt-1 flex items-center gap-1", getChangeColor(kpi.equityChange))}>
                  {getChangeIcon(kpi.equityChange)}
                  {kpi.equityChange > 0 ? "+" : ""}
                  {formatCurrency(kpi.equityChange)}
                </p>
              </CardContent>
            </Card>

            {/* Property Count & Cap Rate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-info" />
                  Avg Cap Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatPercent(kpi.averageCapRate)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.propertyCount} properties
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Portfolio Trend Chart */}
          {trends.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Trend</CardTitle>
                  <CardDescription>Property value over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Property Type Breakdown */}
          {propertyTypes.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Property Types</CardTitle>
                  <CardDescription>Portfolio composition</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={propertyTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, count }) => `${name} (${count})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {propertyTypes.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Deal Flow */}
        {dealFlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Deal Pipeline</CardTitle>
                <CardDescription>Properties at each stage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { stage: "Lead", count: dealFlow.lead },
                      { stage: "Analyzing", count: dealFlow.analyzing },
                      { stage: "Offer", count: dealFlow.offer },
                      { stage: "Under Contract", count: dealFlow.under_contract },
                      { stage: "Owned", count: dealFlow.owned },
                      { stage: "Sold", count: dealFlow.sold },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Property Type Stats Table */}
        {propertyTypes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Property Type Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-semibold">Type</th>
                        <th className="text-right py-2 px-2 font-semibold">Count</th>
                        <th className="text-right py-2 px-2 font-semibold">Total Value</th>
                        <th className="text-right py-2 px-2 font-semibold">Avg Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyTypes.map((ptype) => (
                        <tr key={ptype.type} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2 font-medium capitalize">{ptype.type}</td>
                          <td className="py-2 px-2 text-right">{ptype.count}</td>
                          <td className="py-2 px-2 text-right font-mono">
                            {formatCurrency(ptype.totalValue)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono">
                            {formatCurrency(ptype.averageValue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
