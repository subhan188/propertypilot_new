import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Home, Building } from "lucide-react";
import { useState } from "react";
import { DealAnalyzerModal } from "@/components/modals/DealAnalyzerModal";

interface QuickScenariosProps {
  className?: string;
}

const scenarios = [
  {
    id: 'flip',
    icon: TrendingUp,
    title: 'Quick Flip',
    description: 'Analyze a fix & flip deal',
    color: 'bg-warning/10 text-warning',
  },
  {
    id: 'rental',
    icon: Home,
    title: 'Buy & Hold',
    description: 'Long-term rental analysis',
    color: 'bg-success/10 text-success',
  },
  {
    id: 'airbnb',
    icon: Building,
    title: 'Short-Term Rental',
    description: 'Airbnb/VRBO analysis',
    color: 'bg-info/10 text-info',
  },
];

export function QuickScenarios({ className }: QuickScenariosProps) {
  const [analyzerOpen, setAnalyzerOpen] = useState(false);

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Quick Scenarios</h3>
          <Button variant="ghost" size="sm" className="text-accent">
            <Calculator className="h-4 w-4 mr-1" />
            Full Analyzer
          </Button>
        </div>

        <div className="grid gap-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setAnalyzerOpen(true)}
              className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-colors text-left"
            >
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", scenario.color)}>
                <scenario.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{scenario.title}</p>
                <p className="text-xs text-muted-foreground">{scenario.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <DealAnalyzerModal open={analyzerOpen} onOpenChange={setAnalyzerOpen} />
    </>
  );
}
