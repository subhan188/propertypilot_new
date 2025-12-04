import { cn } from "@/lib/utils";
import { Property } from "@/types/property";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

const statusColors: Record<string, string> = {
  lead: "bg-muted text-muted-foreground",
  analyzing: "bg-info/10 text-info border-info/20",
  offer: "bg-warning/10 text-warning border-warning/20",
  under_contract: "bg-accent/10 text-accent border-accent/20",
  owned: "bg-success/10 text-success border-success/20",
  sold: "bg-muted text-muted-foreground",
};

const typeLabels: Record<string, string> = {
  rent: "Rental",
  airbnb: "Airbnb",
  flip: "Flip",
};

export function PropertyCard({
  property,
  onClick,
  variant = "default",
  className,
}: PropertyCardProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const equity = property.currentValue - property.purchasePrice;
  const equityPercent = ((equity / property.purchasePrice) * 100).toFixed(1);

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-xl border bg-card p-3 cursor-pointer transition-shadow hover:shadow-md",
          className
        )}
      >
        <img
          src={property.photos[0]}
          alt={property.address}
          className="h-12 w-12 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{property.address}</p>
          <p className="text-xs text-muted-foreground">
            {property.city}, {property.state}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-sm">{formatCurrency(property.currentValue)}</p>
          <Badge variant="outline" className={cn("text-xs", statusColors[property.status])}>
            {property.status.replace("_", " ")}
          </Badge>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card cursor-pointer card-hover",
        variant === "featured" && "col-span-2",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={property.photos[0]}
          alt={property.address}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
            {typeLabels[property.type]}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={cn("backdrop-blur-sm", statusColors[property.status])}>
            {property.status.replace("_", " ")}
          </Badge>
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-primary-foreground text-xl font-bold">
            {formatCurrency(property.currentValue)}
          </p>
          {equity > 0 && (
            <div className="flex items-center gap-1 text-success text-sm">
              <TrendingUp className="h-3 w-3" />
              <span>+{formatCurrency(equity)} ({equityPercent}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground truncate">{property.address}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <MapPin className="h-3.5 w-3.5" />
          <span>{property.city}, {property.state} {property.zipCode}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Square className="h-4 w-4" />
            <span>{property.sqft.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
