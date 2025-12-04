import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  searchZillowListings,
  getZillowPropertyDetails,
  importZillowProperty,
  type ZillowSearchParams,
} from "@/services/zillowService";
import { ZillowProperty } from "@/types/api";
import { Loader2, Search, Download, MapPin, Home, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function ZillowSearchPanel() {
  const [keyword, setKeyword] = useState("");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [minBeds, setMinBeds] = useState<number | "">("");
  const [maxBeds, setMaxBeds] = useState<number | "">("");
  const [minBaths, setMinBaths] = useState<number | "">("");
  const [maxBaths, setMaxBaths] = useState<number | "">("");

  const [results, setResults] = useState<ZillowProperty[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<ZillowProperty | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast.error("Please enter a location or address");
      return;
    }

    setLoading(true);
    try {
      const params: ZillowSearchParams = {
        keyword,
        ...(minPrice !== "" && { minPrice: Number(minPrice) }),
        ...(maxPrice !== "" && { maxPrice: Number(maxPrice) }),
        ...(minBeds !== "" && { minBeds: Number(minBeds) }),
        ...(maxBeds !== "" && { maxBeds: Number(maxBeds) }),
        ...(minBaths !== "" && { minBaths: Number(minBaths) }),
        ...(maxBaths !== "" && { maxBaths: Number(maxBaths) }),
      };

      const response = await searchZillowListings(params);

      if (response?.listings) {
        setResults(response.listings);
        toast.success(`Found ${response.count} properties`);
      } else {
        toast.error("No properties found. Try different search criteria.");
        setResults([]);
      }
    } catch (error) {
      toast.error("Failed to search properties");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (property: ZillowProperty) => {
    setImportingId(property.zpid);
    try {
      const result = await importZillowProperty(
        property.zpid,
        "flip",
        `Imported from Zillow - ${property.address}`
      );

      if (result?.property) {
        toast.success("Property imported to portfolio");
        // Remove from search results
        setResults(results.filter((p) => p.zpid !== property.zpid));
        setSelectedProperty(null);
      } else {
        toast.error("Failed to import property");
      }
    } catch (error) {
      toast.error("Error importing property");
      console.error(error);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Search Zillow Properties</CardTitle>
          <CardDescription>Find real estate opportunities via HasData Zillow API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Keyword */}
          <div>
            <Label htmlFor="keyword">Location or Address</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="keyword"
                placeholder="e.g., Boston, MA or 123 Main St"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="btn-accent shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <Label htmlFor="minPrice" className="text-sm">Min Price</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-sm">Max Price</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
                className="mt-1 text-sm"
              />
            </div>

            {/* Beds */}
            <div>
              <Label htmlFor="minBeds" className="text-sm">Min Beds</Label>
              <Input
                id="minBeds"
                type="number"
                placeholder="Min"
                value={minBeds}
                onChange={(e) => setMinBeds(e.target.value ? Number(e.target.value) : "")}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="maxBeds" className="text-sm">Max Beds</Label>
              <Input
                id="maxBeds"
                type="number"
                placeholder="Max"
                value={maxBeds}
                onChange={(e) => setMaxBeds(e.target.value ? Number(e.target.value) : "")}
                className="mt-1 text-sm"
              />
            </div>

            {/* Baths */}
            <div>
              <Label htmlFor="minBaths" className="text-sm">Min Baths</Label>
              <Input
                id="minBaths"
                type="number"
                placeholder="Min"
                value={minBaths}
                onChange={(e) => setMinBaths(e.target.value ? Number(e.target.value) : "")}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="maxBaths" className="text-sm">Max Baths</Label>
              <Input
                id="maxBaths"
                type="number"
                placeholder="Max"
                value={maxBaths}
                onChange={(e) => setMaxBaths(e.target.value ? Number(e.target.value) : "")}
                className="mt-1 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {results.length} properties found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((property) => (
                  <motion.div
                    key={property.zpid}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedProperty(property)}
                  >
                    {/* Property Image */}
                    {property.photos && property.photos.length > 0 && (
                      <div className="relative h-48 bg-muted overflow-hidden">
                        <img
                          src={property.photos[0]}
                          alt={property.address}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop";
                          }}
                        />
                      </div>
                    )}

                    {/* Property Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="font-semibold line-clamp-1">{property.address}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {property.city}, {property.state} {property.zipCode}
                        </div>
                      </div>

                      {/* Key Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Home className="h-4 w-4" />
                          {property.bedrooms}b {property.bathrooms}ba
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {Math.round(property.sqft / 1000)}k sqft
                        </div>
                      </div>

                      {/* Prices */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">List Price:</span>
                          <span className="font-bold">{formatCurrency(property.price)}</span>
                        </div>
                        {property.zestimate && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Zestimate:</span>
                            <span className="text-sm font-semibold">
                              {formatCurrency(property.zestimate)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs capitalize">
                          {property.status || "unknown"}
                        </Badge>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImport(property);
                        }}
                        disabled={importingId === property.zpid}
                        className="w-full btn-accent mt-2"
                        size="sm"
                      >
                        {importingId === property.zpid ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3 mr-1" />
                            Import to Portfolio
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && keyword && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No properties found for "{keyword}"</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
