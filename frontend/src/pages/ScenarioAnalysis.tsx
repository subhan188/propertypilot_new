import { AppLayout } from "@/components/layout/AppLayout";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DealScenario } from "@/types/api";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Download, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScenarioComparison {
  scenarios: DealScenario[];
  ranking: Array<{
    scenarioId: string;
    name: string;
    roi: number;
    totalProfit: number;
    cashOnCash: number;
    rank: number;
  }>;
}

const ScenarioAnalysis = () => {
  const [propertyId, setPropertyId] = useState<string>("");
  const [scenarios, setScenarios] = useState<DealScenario[]>([]);
  const [comparison, setComparison] = useState<ScenarioComparison | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<"roi" | "totalProfit" | "cashOnCash">("roi");

  const { data: scenariosData, loading: scenariosLoading, get: getScenarios } =
    useApi<DealScenario[]>(null);
  const { data: comparisonData, loading: comparisonLoading, post: compareScenarios } =
    useApi<ScenarioComparison>(null);

  useEffect(() => {
    if (scenariosData) {
      setScenarios(scenariosData);
    }
  }, [scenariosData]);

  useEffect(() => {
    if (comparisonData) {
      setComparison(comparisonData);
    }
  }, [comparisonData]);

  const handleLoadScenarios = () => {
    if (propertyId) {
      getScenarios(`/properties/${propertyId}/scenarios`);
    }
  };

  const handleCompare = () => {
    if (scenarios.length > 1) {
      compareScenarios("/analysis/compare-scenarios", {
        scenarioIds: scenarios.map((s) => s.id),
      });
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-success/10 text-success";
    if (rank === 2) return "bg-info/10 text-info";
    if (rank === 3) return "bg-warning/10 text-warning";
    return "";
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
            <h1 className="text-2xl font-bold text-foreground">Scenario Analysis</h1>
            <p className="text-muted-foreground">Compare multiple deal scenarios side-by-side</p>
          </div>
          <Button className="btn-accent" onClick={handleCompare} disabled={scenarios.length < 2}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Compare Scenarios
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-base p-4 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="property">Select Property</Label>
              <Input
                id="property"
                placeholder="Enter property ID or select from list"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="metric">Sort By Metric</Label>
              <Select value={selectedMetric} onValueChange={(v: any) => setSelectedMetric(v)}>
                <SelectTrigger id="metric" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roi">ROI %</SelectItem>
                  <SelectItem value="totalProfit">Total Profit</SelectItem>
                  <SelectItem value="cashOnCash">Cash-on-Cash %</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleLoadScenarios}
                disabled={scenariosLoading}
              >
                <Filter className="h-4 w-4 mr-2" />
                Load Scenarios
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Scenarios List */}
        {scenarios.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card-base"
          >
            <div className="p-4 border-b">
              <h3 className="font-semibold">Available Scenarios ({scenarios.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="cursor-pointer hover:border-accent transition">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <CardDescription className="text-xs">
                      ID: {scenario.id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchase:</span>
                      <span className="font-semibold">{formatCurrency(scenario.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rehab:</span>
                      <span className="font-semibold">{formatCurrency(scenario.rehabCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strategy:</span>
                      <span className="font-semibold capitalize">{scenario.exitStrategy}</span>
                    </div>
                    {scenario.roi && (
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-muted-foreground">ROI:</span>
                        <span className="font-bold text-success">{formatPercent(scenario.roi)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Comparison Results */}
        {comparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Scenario Rankings
                </CardTitle>
                <CardDescription>Ranked by {selectedMetric}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">Rank</TableHead>
                      <TableHead>Scenario Name</TableHead>
                      <TableHead className="text-right">ROI</TableHead>
                      <TableHead className="text-right">Cash-on-Cash</TableHead>
                      <TableHead className="text-right">Total Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparison.ranking.map((item) => (
                      <TableRow key={item.scenarioId} className={cn(getRankColor(item.rank))}>
                        <TableCell className="font-bold text-center">#{item.rank}</TableCell>
                        <TableCell className="font-semibold">{item.name}</TableCell>
                        <TableCell className="text-right">{formatPercent(item.roi)}</TableCell>
                        <TableCell className="text-right">
                          {formatPercent(item.cashOnCash)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.totalProfit)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Detailed Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scenario</TableHead>
                        <TableHead className="text-right">Purchase Price</TableHead>
                        <TableHead className="text-right">Rehab Cost</TableHead>
                        <TableHead className="text-right">Total Investment</TableHead>
                        <TableHead className="text-right">Monthly Profit</TableHead>
                        <TableHead className="text-right">ROI</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparison.scenarios.map((scenario) => (
                        <TableRow key={scenario.id}>
                          <TableCell className="font-semibold">{scenario.name}</TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(scenario.purchasePrice)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(scenario.rehabCost)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {formatCurrency(
                              scenario.purchasePrice + scenario.rehabCost + scenario.closingCosts
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm font-semibold">
                            {formatCurrency(scenario.monthlyNOI || 0)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-success">
                            {scenario.roi ? formatPercent(scenario.roi) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </Button>
              <Button className="btn-accent">
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default ScenarioAnalysis;
