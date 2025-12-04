import { SensitivityAnalysis } from "@/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface SensitivityAnalysisChartProps {
  analysis: SensitivityAnalysis;
}

export function SensitivityAnalysisChart({ analysis }: SensitivityAnalysisChartProps) {
  const chartData = analysis.variations.map((v) => ({
    variable: v.variable.replace(/([A-Z])/g, " $1").trim(),
    change: `${v.change > 0 ? "+" : ""}${v.change}%`,
    roi: v.roi,
    profit: v.totalProfit,
    capRate: v.capRate,
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const getChangeColor = (changeText: string) => {
    const change = parseFloat(changeText);
    if (change === 0) return "#6B7280"; // gray
    if (change > 0) return "#10B981"; // green
    return "#EF4444"; // red
  };

  return (
    <div className="space-y-6">
      {/* ROI Impact Chart */}
      <Card>
        <CardHeader>
          <CardTitle>ROI Impact Analysis</CardTitle>
          <CardDescription>
            How changes in key variables affect return on investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="change" />
              <YAxis />
              <Tooltip formatter={(value) => formatPercent(value as number)} />
              <Bar dataKey="roi" fill="#3B82F6">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getChangeColor(entry.change)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Impact Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Total Profit Impact</CardTitle>
          <CardDescription>
            Expected profit at different price points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="change" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cap Rate Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Cap Rate Sensitivity</CardTitle>
          <CardDescription>
            Capitalization rate across scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="change" />
              <YAxis />
              <Tooltip formatter={(value) => formatPercent(value as number)} />
              <Bar dataKey="capRate" fill="#8B5CF6">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getChangeColor(entry.change)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Variations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Sensitivity Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-semibold">Variable</th>
                  <th className="text-left py-2 px-2 font-semibold">Change</th>
                  <th className="text-right py-2 px-2 font-semibold">ROI</th>
                  <th className="text-right py-2 px-2 font-semibold">Total Profit</th>
                  <th className="text-right py-2 px-2 font-semibold">Cap Rate</th>
                </tr>
              </thead>
              <tbody>
                {analysis.variations.map((variation, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 capitalize">
                      {variation.variable.replace(/([A-Z])/g, " $1").trim()}
                    </td>
                    <td className={cn(
                      "py-2 px-2 font-semibold",
                      variation.change > 0 ? "text-success" : variation.change < 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {variation.change > 0 ? "+" : ""}{variation.change}%
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {formatPercent(variation.roi)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {formatCurrency(variation.totalProfit)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {formatPercent(variation.capRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
