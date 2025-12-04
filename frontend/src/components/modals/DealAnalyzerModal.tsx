import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Property, DealScenario } from "@/types/property";
import { Calculator, TrendingUp, DollarSign, Percent, Save } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DealAnalyzerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property;
}

interface ScenarioInputs {
  name: string;
  purchasePrice: number;
  rehabCost: number;
  interestRate: number;
  holdTimeMonths: number;
  exitStrategy: 'rent' | 'airbnb' | 'flip';
  monthlyRent: number;
  occupancyRate: number;
  dailyRate: number;
  averageOccupancy: number;
  salePrice: number;
  useAirbnbProfile: boolean;
}

const defaultInputs: ScenarioInputs = {
  name: "Scenario 1",
  purchasePrice: 300000,
  rehabCost: 50000,
  interestRate: 7.5,
  holdTimeMonths: 12,
  exitStrategy: 'rent',
  monthlyRent: 2200,
  occupancyRate: 95,
  dailyRate: 185,
  averageOccupancy: 70,
  salePrice: 400000,
  useAirbnbProfile: false,
};

export function DealAnalyzerModal({
  open,
  onOpenChange,
  property,
}: DealAnalyzerModalProps) {
  const [inputs, setInputs] = useState<ScenarioInputs>(defaultInputs);
  const [savedScenarios, setSavedScenarios] = useState<ScenarioInputs[]>([]);

  // Real-time calculations
  const calculations = useMemo(() => {
    const totalInvestment = inputs.purchasePrice + inputs.rehabCost;
    const holdingCosts = (totalInvestment * (inputs.interestRate / 100) / 12) * inputs.holdTimeMonths;
    const closingCosts = inputs.purchasePrice * 0.03;

    let annualIncome = 0;
    let annualExpenses = 0;
    let totalProfit = 0;
    let capRate = 0;
    let cashOnCash = 0;
    let roi = 0;
    let monthlyNOI = 0;

    if (inputs.exitStrategy === 'rent') {
      annualIncome = inputs.monthlyRent * 12 * (inputs.occupancyRate / 100);
      annualExpenses = annualIncome * 0.35; // Operating expenses estimate
      const noi = annualIncome - annualExpenses;
      monthlyNOI = noi / 12;
      capRate = (noi / totalInvestment) * 100;
      cashOnCash = (noi / (totalInvestment * 0.25)) * 100; // Assuming 25% down
      roi = capRate;
    } else if (inputs.exitStrategy === 'airbnb') {
      const monthlyIncome = inputs.dailyRate * 30 * (inputs.averageOccupancy / 100);
      annualIncome = monthlyIncome * 12;
      annualExpenses = annualIncome * 0.45; // Higher expenses for STR
      const noi = annualIncome - annualExpenses;
      monthlyNOI = noi / 12;
      capRate = (noi / totalInvestment) * 100;
      cashOnCash = (noi / (totalInvestment * 0.25)) * 100;
      roi = capRate;
    } else {
      // Flip
      const sellingCosts = inputs.salePrice * 0.08;
      totalProfit = inputs.salePrice - totalInvestment - holdingCosts - closingCosts - sellingCosts;
      roi = (totalProfit / totalInvestment) * 100;
    }

    return {
      totalInvestment,
      holdingCosts,
      closingCosts,
      annualIncome,
      annualExpenses,
      totalProfit,
      capRate,
      cashOnCash,
      roi,
      monthlyNOI,
    };
  }, [inputs]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const saveScenario = () => {
    if (savedScenarios.length < 3) {
      setSavedScenarios([...savedScenarios, { ...inputs, name: `Scenario ${savedScenarios.length + 1}` }]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calculator className="h-4 w-4 text-accent" />
            </div>
            Deal Analyzer
            {property && (
              <span className="text-muted-foreground font-normal text-sm ml-2">
                {property.address}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="rental" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger 
              value="rental"
              onClick={() => setInputs({ ...inputs, exitStrategy: 'rent' })}
            >
              Rental
            </TabsTrigger>
            <TabsTrigger 
              value="airbnb"
              onClick={() => setInputs({ ...inputs, exitStrategy: 'airbnb' })}
            >
              Airbnb
            </TabsTrigger>
            <TabsTrigger 
              value="flip"
              onClick={() => setInputs({ ...inputs, exitStrategy: 'flip' })}
            >
              Flip
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Input Section */}
            <div className="space-y-5">
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Purchase Price</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={inputs.purchasePrice}
                      onChange={(e) => setInputs({ ...inputs, purchasePrice: Number(e.target.value) })}
                      className="font-mono"
                    />
                  </div>
                  <Slider
                    value={[inputs.purchasePrice]}
                    onValueChange={([val]) => setInputs({ ...inputs, purchasePrice: val })}
                    min={50000}
                    max={1000000}
                    step={5000}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Rehab Cost</Label>
                  <Input
                    type="number"
                    value={inputs.rehabCost}
                    onChange={(e) => setInputs({ ...inputs, rehabCost: Number(e.target.value) })}
                    className="font-mono mt-1"
                  />
                  <Slider
                    value={[inputs.rehabCost]}
                    onValueChange={([val]) => setInputs({ ...inputs, rehabCost: val })}
                    min={0}
                    max={200000}
                    step={1000}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Interest Rate (%)</Label>
                  <Input
                    type="number"
                    value={inputs.interestRate}
                    onChange={(e) => setInputs({ ...inputs, interestRate: Number(e.target.value) })}
                    className="font-mono mt-1"
                    step={0.25}
                  />
                  <Slider
                    value={[inputs.interestRate]}
                    onValueChange={([val]) => setInputs({ ...inputs, interestRate: val })}
                    min={4}
                    max={15}
                    step={0.25}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Hold Time (months)</Label>
                  <Input
                    type="number"
                    value={inputs.holdTimeMonths}
                    onChange={(e) => setInputs({ ...inputs, holdTimeMonths: Number(e.target.value) })}
                    className="font-mono mt-1"
                  />
                  <Slider
                    value={[inputs.holdTimeMonths]}
                    onValueChange={([val]) => setInputs({ ...inputs, holdTimeMonths: val })}
                    min={1}
                    max={36}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Strategy-specific inputs */}
              <TabsContent value="rental" className="mt-0 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Monthly Rent</Label>
                  <Input
                    type="number"
                    value={inputs.monthlyRent}
                    onChange={(e) => setInputs({ ...inputs, monthlyRent: Number(e.target.value) })}
                    className="font-mono mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Occupancy Rate (%)</Label>
                  <Slider
                    value={[inputs.occupancyRate]}
                    onValueChange={([val]) => setInputs({ ...inputs, occupancyRate: val })}
                    min={50}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-sm text-muted-foreground">{inputs.occupancyRate}%</span>
                </div>
              </TabsContent>

              <TabsContent value="airbnb" className="mt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Use Airbnb Profile Data</Label>
                  <Switch
                    checked={inputs.useAirbnbProfile}
                    onCheckedChange={(checked) => setInputs({ ...inputs, useAirbnbProfile: checked })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Daily Rate (ADR)</Label>
                  <Input
                    type="number"
                    value={inputs.dailyRate}
                    onChange={(e) => setInputs({ ...inputs, dailyRate: Number(e.target.value) })}
                    className="font-mono mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Average Occupancy (%)</Label>
                  <Slider
                    value={[inputs.averageOccupancy]}
                    onValueChange={([val]) => setInputs({ ...inputs, averageOccupancy: val })}
                    min={30}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <span className="text-sm text-muted-foreground">{inputs.averageOccupancy}%</span>
                </div>
              </TabsContent>

              <TabsContent value="flip" className="mt-0 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">After Repair Value (Sale Price)</Label>
                  <Input
                    type="number"
                    value={inputs.salePrice}
                    onChange={(e) => setInputs({ ...inputs, salePrice: Number(e.target.value) })}
                    className="font-mono mt-1"
                  />
                  <Slider
                    value={[inputs.salePrice]}
                    onValueChange={([val]) => setInputs({ ...inputs, salePrice: val })}
                    min={inputs.purchasePrice}
                    max={inputs.purchasePrice * 2}
                    step={5000}
                    className="mt-2"
                  />
                </div>
              </TabsContent>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <div className="card-elevated">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Deal Summary</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Investment</span>
                    <span className="font-semibold">{formatCurrency(calculations.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Holding Costs</span>
                    <span className="font-semibold">{formatCurrency(calculations.holdingCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Closing Costs</span>
                    <span className="font-semibold">{formatCurrency(calculations.closingCosts)}</span>
                  </div>
                </div>
              </div>

              <div className="card-elevated bg-accent/5 border-accent/20">
                <h4 className="text-sm font-medium text-accent mb-3">Returns</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    key={calculations.roi}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-center p-3 rounded-xl bg-background"
                  >
                    <div className="flex items-center justify-center gap-1 text-accent mb-1">
                      <Percent className="h-4 w-4" />
                      <span className="text-xs font-medium">ROI</span>
                    </div>
                    <span className={cn(
                      "text-2xl font-bold",
                      calculations.roi >= 10 ? "text-success" : calculations.roi >= 0 ? "text-warning" : "text-destructive"
                    )}>
                      {calculations.roi.toFixed(1)}%
                    </span>
                  </motion.div>

                  {inputs.exitStrategy !== 'flip' ? (
                    <>
                      <motion.div
                        key={calculations.capRate}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="text-center p-3 rounded-xl bg-background"
                      >
                        <div className="flex items-center justify-center gap-1 text-accent mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs font-medium">Cap Rate</span>
                        </div>
                        <span className="text-2xl font-bold">{calculations.capRate.toFixed(1)}%</span>
                      </motion.div>

                      <motion.div
                        key={calculations.cashOnCash}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="text-center p-3 rounded-xl bg-background"
                      >
                        <div className="flex items-center justify-center gap-1 text-accent mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs font-medium">Cash-on-Cash</span>
                        </div>
                        <span className="text-2xl font-bold">{calculations.cashOnCash.toFixed(1)}%</span>
                      </motion.div>

                      <motion.div
                        key={calculations.monthlyNOI}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="text-center p-3 rounded-xl bg-background"
                      >
                        <div className="flex items-center justify-center gap-1 text-accent mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs font-medium">Monthly NOI</span>
                        </div>
                        <span className="text-2xl font-bold">{formatCurrency(calculations.monthlyNOI)}</span>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      key={calculations.totalProfit}
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="text-center p-3 rounded-xl bg-background"
                    >
                      <div className="flex items-center justify-center gap-1 text-accent mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs font-medium">Total Profit</span>
                      </div>
                      <span className={cn(
                        "text-2xl font-bold",
                        calculations.totalProfit >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {formatCurrency(calculations.totalProfit)}
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Saved Scenarios */}
              {savedScenarios.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Saved Scenarios ({savedScenarios.length}/3)</Label>
                  {savedScenarios.map((scenario, index) => (
                    <button
                      key={index}
                      onClick={() => setInputs(scenario)}
                      className="w-full text-left p-2 rounded-lg border hover:bg-muted/50 text-sm"
                    >
                      {scenario.name} - {formatCurrency(scenario.purchasePrice)}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={saveScenario}
                  disabled={savedScenarios.length >= 3}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Scenario
                </Button>
                <Button className="flex-1 btn-accent">
                  Export Analysis
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
