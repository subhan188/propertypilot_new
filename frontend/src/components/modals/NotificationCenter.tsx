import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp?: string;
}

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alerts?: Alert[];
}

export function NotificationCenter({
  open,
  onOpenChange,
  alerts = [],
}: NotificationCenterProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "error":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
        </DialogHeader>

        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg flex items-start justify-between gap-4 ${getTypeColor(
                  alert.type
                )}`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeBadgeColor(
                        alert.type
                      )}`}
                    >
                      {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{alert.message}</p>
                  {alert.timestamp && (
                    <p className="text-xs opacity-75">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
                <button className="p-1 hover:bg-black/10 rounded-md transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1">
            Clear All
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
