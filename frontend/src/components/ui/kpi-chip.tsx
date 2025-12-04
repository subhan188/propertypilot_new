import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPIChipProps {
  label: string;
  value: string | number;
  change?: number;
  format?: "currency" | "percentage" | "number";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function KPIChip({
  label,
  value,
  change,
  format = "number",
  size = "md",
  className,
}: KPIChipProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;
    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case "percentage":
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat("en-US").format(val);
    }
  };

  const getTrend = () => {
    if (change === undefined) return null;
    if (change > 0) return { icon: TrendingUp, class: "kpi-positive" };
    if (change < 0) return { icon: TrendingDown, class: "kpi-negative" };
    return { icon: Minus, class: "kpi-neutral" };
  };

  const trend = getTrend();

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col rounded-xl border bg-card shadow-xs",
        sizeClasses[size],
        className
      )}
    >
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-foreground">{formatValue(value)}</span>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
              trend.class
            )}
          >
            <trend.icon className="h-3 w-3" />
            {Math.abs(change!).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
