import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DealScenario, AnalysisResult } from "@/types/api";
import { useApi } from "@/hooks/useApi";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: DealScenario | null;
}

export function DealAnalysisModal({ open, onOpenChange, scenario }: DealAnalysisModalProps) {
  const { data: analysis, loading, error, post } = useApi<AnalysisResult>(null);

  useEffect(() => {
    if (open && scenario?.id) {
      post(`/scenarios/${scenario.id}/analyze`, {
        propertyId: scenario.propertyId,
        scenarioId: scenario.id,
      });
    }
  }, [open, scenario?.id, post]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const metrics = analysis?.metrics || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deal Analysis: {scenario?.name}</DialogTitle>
          <DialogDescription>
            Complete financial breakdown and investment metrics
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
            <span className="ml-2 text-muted-foreground">Analyzing deal...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {metrics && (
          <div className="space-y-6">
            {/* Investment Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-1">Purchase Price</p>
                <p className="text-2xl font-bold">{formatCurrency(scenario?.purchasePrice || 0)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-1">Rehab Cost</p>
                <p className="text-2xl font-bold">{formatCurrency(scenario?.rehabCost || 0)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-1">Holding Costs</p>
                <p className="text-2xl font-bold">{formatCurrency(scenario?.holdingCosts || 0)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-1">Closing Costs</p>
                <p className="text-2xl font-bold">{formatCurrency(scenario?.closingCosts || 0)}</p>
              </div>
            </div>

            {/* Key Performance Indicators */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* NOI */}
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Net Operating Income (NOI)</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(metrics.noi)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Annual operating profit</p>
                </div>

                {/* Cap Rate */}
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Capitalization Rate</p>
                  <p className="text-2xl font-bold text-success">{formatPercent(metrics.capRate)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Annual return on property value</p>
                </div>

                {/* Cash-on-Cash */}
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cash-on-Cash Return</p>
                  <p className="text-2xl font-bold text-accent">{formatPercent(metrics.cashOnCash)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Annual return on cash invested</p>
                </div>

                {/* ROI */}
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Return on Investment (ROI)</p>
                  <p className="text-2xl font-bold text-accent">{formatPercent(metrics.roi)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total percentage return</p>
                </div>

                {/* IRR */}
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Internal Rate of Return (IRR)</p>
                  <p className="text-2xl font-bold text-info">{formatPercent(metrics.irr)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Annualized return rate</p>
                </div>

                {/* NPV */}
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Net Present Value (NPV)</p>
                  <p className={cn(
                    "text-2xl font-bold",
                    metrics.npv >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {formatCurrency(metrics.npv)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Present value of cash flows</p>
                </div>
              </div>
            </div>

            {/* Profit Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-1">Monthly Profit</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(metrics.monthlyProfit)}</p>
              </div>
              <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-1">Break-Even</p>
                <p className="text-2xl font-bold text-info">{metrics.breakEvenMonths} months</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-muted rounded">
                <p className="text-muted-foreground mb-1">Hold Time</p>
                <p className="font-semibold">{scenario?.holdTimeMonths} months</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="text-muted-foreground mb-1">Interest Rate</p>
                <p className="font-semibold">{scenario?.interestRate}%</p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="text-muted-foreground mb-1">Exit Strategy</p>
                <p className="font-semibold capitalize">{scenario?.exitStrategy}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button className="btn-accent">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
