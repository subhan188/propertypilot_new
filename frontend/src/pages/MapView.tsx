import { AppLayout } from "@/components/layout/AppLayout";
import { mockProperties } from "@/mocks/properties";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Property } from "@/types/property";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PropertyCard } from "@/components/ui/property-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Locate,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

type HeatmapType = 'caprate' | 'risk' | 'arv' | 'none';

const MapView = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [heatmapType, setHeatmapType] = useState<HeatmapType>('caprate');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProperties = mockProperties.filter(p =>
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="relative h-[calc(100vh-7rem)] -m-6">
        {/* Map Container */}
        <div className="absolute inset-0">
          {/* Map Background */}
          <div 
            className="h-full w-full"
            style={{
              background: `
                linear-gradient(180deg, 
                  hsl(var(--navy-100)) 0%, 
                  hsl(var(--navy-200)) 50%,
                  hsl(var(--navy-100)) 100%
                )
              `,
            }}
          >
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--navy-300)) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--navy-300)) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />

            {/* Heatmap overlay */}
            {heatmapType !== 'none' && (
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: `
                    radial-gradient(circle at 30% 40%, hsl(var(--success) / 0.4) 0%, transparent 30%),
                    radial-gradient(circle at 70% 30%, hsl(var(--warning) / 0.4) 0%, transparent 25%),
                    radial-gradient(circle at 50% 60%, hsl(var(--accent) / 0.4) 0%, transparent 35%),
                    radial-gradient(circle at 80% 70%, hsl(var(--success) / 0.3) 0%, transparent 20%)
                  `,
                }}
              />
            )}
            
            {/* Property Markers */}
            {mockProperties.map((property, index) => {
              // Distribute markers across the map
              const positions = [
                { top: '20%', left: '25%' },
                { top: '35%', left: '65%' },
                { top: '50%', left: '40%' },
                { top: '25%', left: '50%' },
                { top: '60%', left: '20%' },
                { top: '40%', left: '80%' },
                { top: '70%', left: '55%' },
                { top: '30%', left: '15%' },
                { top: '55%', left: '70%' },
                { top: '45%', left: '30%' },
                { top: '65%', left: '85%' },
                { top: '80%', left: '35%' },
                { top: '15%', left: '75%' },
                { top: '75%', left: '15%' },
                { top: '35%', left: '45%' },
                { top: '85%', left: '65%' },
                { top: '25%', left: '85%' },
                { top: '60%', left: '50%' },
                { top: '40%', left: '10%' },
                { top: '70%', left: '75%' },
              ];
              const pos = positions[index % positions.length];
              const isSelected = selectedProperty?.id === property.id;
              
              return (
                <motion.div
                  key={property.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                  style={{ top: pos.top, left: pos.left }}
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className={cn(
                    "relative transition-transform",
                    isSelected && "scale-125"
                  )}>
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shadow-lg ring-2 ring-background",
                      "transition-colors",
                      property.status === 'owned' ? 'bg-success' :
                      property.status === 'under_contract' ? 'bg-accent' :
                      property.status === 'offer' ? 'bg-warning' :
                      property.status === 'analyzing' ? 'bg-info' :
                      'bg-muted-foreground'
                    )}>
                      <MapPin className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 h-10 w-10 rounded-full bg-accent/50 animate-ping" />
                    )}
                  </div>
                  
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-card rounded-lg shadow-lg p-2 text-xs whitespace-nowrap border">
                      <p className="font-medium">{property.address}</p>
                      <p className="text-muted-foreground">{property.city}, {property.state}</p>
                      <p className="text-accent font-semibold mt-1">
                        ${property.currentValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Map Controls - Top Left */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/95 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Map Controls - Top Right */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <Select value={heatmapType} onValueChange={(val) => setHeatmapType(val as HeatmapType)}>
            <SelectTrigger className="w-[140px] bg-background/95 backdrop-blur-sm">
              <Layers className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="caprate">Cap Rate</SelectItem>
              <SelectItem value="risk">Risk Score</SelectItem>
              <SelectItem value="arv">ARV</SelectItem>
              <SelectItem value="none">No Heatmap</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Zoom Controls - Bottom Right */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1">
          <Button size="icon" variant="secondary" className="bg-background/95 backdrop-blur-sm">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="bg-background/95 backdrop-blur-sm">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="bg-background/95 backdrop-blur-sm">
            <Locate className="h-4 w-4" />
          </Button>
        </div>

        {/* Heatmap Legend - Bottom Left */}
        {heatmapType !== 'none' && (
          <div className="absolute bottom-4 left-4 z-20 bg-background/95 backdrop-blur-sm rounded-xl p-3 border">
            <p className="text-xs font-medium mb-2 capitalize">{heatmapType} Legend</p>
            <div className="flex items-center gap-2">
              <div className="h-3 w-24 rounded-full bg-gradient-to-r from-destructive via-warning to-success" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        )}

        {/* Property Sidebar */}
        <motion.div
          initial={{ x: 320 }}
          animate={{ x: sidebarOpen ? 0 : 320 }}
          className="absolute top-0 right-0 bottom-0 w-80 bg-background/95 backdrop-blur-sm border-l z-30"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -left-10 top-4 bg-background/95 backdrop-blur-sm border"
          >
            {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          <div className="p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Properties</h3>
              <Badge variant="secondary">{filteredProperties.length}</Badge>
            </div>

            {selectedProperty ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Selected Property</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedProperty(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <PropertyCard
                  property={selectedProperty}
                  onClick={() => navigate(`/properties/${selectedProperty.id}`)}
                />
                <Button 
                  className="w-full btn-accent"
                  onClick={() => navigate(`/properties/${selectedProperty.id}`)}
                >
                  View Full Details
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProperties.slice(0, 10).map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    variant="compact"
                    onClick={() => setSelectedProperty(property)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default MapView;
