import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MortgageSchedule } from "@/types/api";
import { useApi } from "@/hooks/useApi";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MortgageCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MortgageCalculatorModal({ open, onOpenChange }: MortgageCalculatorModalProps) {
  const { data: schedule, loading, post } = useApi<MortgageSchedule>(null);
  const [principal, setPrincipal] = useState<string>("250000");
  const [annualRate, setAnnualRate] = useState<string>("6.5");
  const [months, setMonths] = useState<string>("360");

  const handleCalculate = () => {
    post("/analysis/mortgage-schedule", {
      principal: parseFloat(principal),
      annualRate: parseFloat(annualRate),
      months: parseInt(months),
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mortgage Calculator</DialogTitle>
          <DialogDescription>
            Calculate monthly payments and view amortization schedule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <Label htmlFor="principal" className="text-sm">
                Loan Amount ($)
              </Label>
              <Input
                id="principal"
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="250000"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="rate" className="text-sm">
                Annual Interest Rate (%)
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                placeholder="6.5"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="months" className="text-sm">
                Loan Term (months)
              </Label>
              <Input
                id="months"
                type="number"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                placeholder="360"
                className="mt-2"
              />
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            className="btn-accent w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              "Calculate Mortgage"
            )}
          </Button>

          {schedule && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                  <p className="text-2xl font-bold text-accent">
                    {formatCurrency(schedule.monthlyPayment)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-2xl font-bold text-warning">
                    {formatCurrency(schedule.totalInterest)}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Payment</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(schedule.principal + schedule.totalInterest)}
                  </p>
                </div>
              </div>

              {/* Amortization Schedule Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Amortization Schedule</h3>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted">
                      <TableRow>
                        <TableHead className="w-16">Month</TableHead>
                        <TableHead className="text-right">Payment</TableHead>
                        <TableHead className="text-right">Principal</TableHead>
                        <TableHead className="text-right">Interest</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedule.schedule.map((entry) => (
                        <TableRow key={entry.month} className="text-sm">
                          <TableCell className="font-medium">{entry.month}</TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(entry.payment)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-success">
                            {formatCurrency(entry.principal)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-warning">
                            {formatCurrency(entry.interest)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(entry.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {schedule && (
              <Button className="btn-accent">
                <Download className="h-4 w-4 mr-2" />
                Export Schedule
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
