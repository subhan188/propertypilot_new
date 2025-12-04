import { Alert } from "@/types/property";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface AlertsListProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
  className?: string;
}

const alertIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: AlertCircle,
};

const alertColors = {
  info: "border-info/30 bg-info/5",
  warning: "border-warning/30 bg-warning/5",
  success: "border-success/30 bg-success/5",
  error: "border-destructive/30 bg-destructive/5",
};

const iconColors = {
  info: "text-info",
  warning: "text-warning",
  success: "text-success",
  error: "text-destructive",
};

export function AlertsList({ alerts, onDismiss, className }: AlertsListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => {
          const Icon = alertIcons[alert.type];
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3",
                alertColors[alert.type],
                !alert.read && "ring-1 ring-offset-1",
                !alert.read && alert.type === "info" && "ring-info/50",
                !alert.read && alert.type === "warning" && "ring-warning/50",
                !alert.read && alert.type === "success" && "ring-success/50",
                !alert.read && alert.type === "error" && "ring-destructive/50"
              )}
            >
              <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", iconColors[alert.type])} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{alert.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                </p>
              </div>
              {onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
