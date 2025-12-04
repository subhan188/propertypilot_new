/**
 * Property Detail View with Zillow Integration
 * Displays comprehensive property information including Zillow data
 */

import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Bed,
  Bath,
  Square,
  TrendingUp,
  ExternalLink,
  ChevronLeft,
  Calendar,
  DollarSign,
  Home,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
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

export function PropertyDetail({ property, onBack }: PropertyDetailProps) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const equity = property.currentValue - property.purchasePrice;
  const equityPercent = ((equity / property.purchasePrice) * 100).toFixed(1);
  const pricePerSqft = (property.purchasePrice / property.sqft).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{property.address}</h1>
      </div>

      {/* Photo Gallery */}
      {property.photos && property.photos.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden bg-muted"
        >
          <div className="relative aspect-video bg-gray-200">
            <img
              src={property.photos[activePhotoIndex]}
              alt={`${property.address} - Photo ${activePhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Zillow Link (if available) */}
            {property.zillowUrl && (
              <a
                href={property.zillowUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 bg-white/90 hover:bg-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View on Zillow
              </a>
            )}

            {/* Photo Counter */}
            {property.photos.length > 1 && (
              <div className="absolute bottom-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {activePhotoIndex + 1} / {property.photos.length}
              </div>
            )}
          </div>

          {/* Photo Thumbnails */}
          {property.photos.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-muted/50">
              {property.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden border-2 transition-all ${
                    activePhotoIndex === idx
                      ? "border-accent"
                      : "border-transparent opacity-50 hover:opacity-75"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-xl border p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Property Information
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {property.city}, {property.state} {property.zipCode}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-primary/90 text-primary-foreground">
                  {typeLabels[property.type]}
                </Badge>
                <Badge variant="outline" className={statusColors[property.status]}>
                  {property.status.replace("_", " ")}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Bedrooms</p>
                <div className="flex items-center gap-1 mt-1">
                  <Bed className="h-4 w-4 text-accent" />
                  <span className="font-semibold">{property.bedrooms}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bathrooms</p>
                <div className="flex items-center gap-1 mt-1">
                  <Bath className="h-4 w-4 text-accent" />
                  <span className="font-semibold">{property.bathrooms}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Square Feet</p>
                <div className="flex items-center gap-1 mt-1">
                  <Square className="h-4 w-4 text-accent" />
                  <span className="font-semibold">{property.sqft.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Price/Sqft</p>
                <p className="font-semibold mt-1">${pricePerSqft}</p>
              </div>
            </div>
          </motion.div>

          {/* Financial Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border p-6 space-y-4"
          >
            <h3 className="font-semibold text-foreground">Financial Overview</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Purchase Price</p>
                <p className="text-lg font-semibold mt-1">
                  {formatCurrency(property.purchasePrice)}
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground">Current Value</p>
                <p className="text-lg font-semibold mt-1">
                  {formatCurrency(property.currentValue)}
                </p>
              </div>
              {property.arv && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">ARV</p>
                  <p className="text-lg font-semibold mt-1">
                    {formatCurrency(property.arv)}
                  </p>
                </div>
              )}
              {equity !== 0 && (
                <div className={`p-4 rounded-lg ${
                  equity > 0 ? "bg-success/10" : "bg-destructive/10"
                }`}>
                  <p className="text-xs text-muted-foreground">Equity</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className={`h-4 w-4 ${
                      equity > 0 ? "text-success" : "text-destructive"
                    }`} />
                    <p className={`text-lg font-semibold ${
                      equity > 0 ? "text-success" : "text-destructive"
                    }`}>
                      {equity > 0 ? "+" : ""}{formatCurrency(equity)} ({equityPercent}%)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Zillow Data Section (if available) */}
          {property.zestimate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Zillow Market Data</h3>
                <Badge variant="outline" className="bg-blue-100/50 text-blue-700 border-blue-200">
                  <Home className="h-3 w-3 mr-1" />
                  Zillow
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/50 dark:bg-blue-900/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Zestimate</p>
                  <p className="text-lg font-semibold mt-1 text-blue-700">
                    {formatCurrency(property.zestimate)}
                  </p>
                  {property.lastFetched && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated {new Date(property.lastFetched).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {property.rentZestimate && (
                  <div className="p-3 bg-white/50 dark:bg-blue-900/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Rent Estimate</p>
                    <p className="text-lg font-semibold mt-1 text-blue-700">
                      {formatCurrency(property.rentZestimate)}/mo
                    </p>
                  </div>
                )}
              </div>

              {property.zillowStatus && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-muted-foreground">
                    Market Status: <span className="font-medium text-foreground capitalize">
                      {property.zillowStatus.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </span>
                </div>
              )}

              {property.zillowUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a href={property.zillowUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Zillow Listing
                  </a>
                </Button>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Quick Info */}
          <div className="bg-card rounded-xl border p-4 space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Quick Info</h4>

            {property.yearBuilt && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Year Built</p>
                  <p className="font-medium">{property.yearBuilt}</p>
                </div>
              </div>
            )}

            {property.lotSize && (
              <div className="flex items-center gap-3 text-sm">
                <Home className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Lot Size</p>
                  <p className="font-medium">{property.lotSize} acres</p>
                </div>
              </div>
            )}

            {property.taxAssessment && (
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tax Assessment</p>
                  <p className="font-medium">{formatCurrency(property.taxAssessment)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium mt-1">{property.address}</p>
                <p className="text-xs text-muted-foreground">
                  {property.city}, {property.state} {property.zipCode}
                </p>
                {property.latitude && property.longitude && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {property.notes && (
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-2">Notes</p>
              <p className="text-sm text-foreground">{property.notes}</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
