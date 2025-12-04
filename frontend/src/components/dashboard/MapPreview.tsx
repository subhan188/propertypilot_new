import { Property } from "@/types/property";
import { cn } from "@/lib/utils";
import { MapPin, Layers, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface MapPreviewProps {
  properties: Property[];
  className?: string;
}

export function MapPreview({ properties, className }: MapPreviewProps) {
  const navigate = useNavigate();
  
  // Simple map placeholder with property dots
  const ownedProperties = properties.filter(p => p.status === 'owned');

  return (
    <div className={cn("relative rounded-2xl overflow-hidden bg-muted", className)}>
      {/* Map background placeholder */}
      <div 
        className="absolute inset-0"
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
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--navy-300)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--navy-300)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Property markers */}
        {ownedProperties.slice(0, 8).map((property, index) => {
          const positions = [
            { top: '25%', left: '30%' },
            { top: '35%', left: '70%' },
            { top: '55%', left: '45%' },
            { top: '20%', left: '55%' },
            { top: '65%', left: '25%' },
            { top: '45%', left: '80%' },
            { top: '75%', left: '60%' },
            { top: '40%', left: '15%' },
          ];
          const pos = positions[index];
          
          return (
            <div
              key={property.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ top: pos.top, left: pos.left }}
            >
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shadow-lg ring-2 ring-background group-hover:scale-110 transition-transform">
                  <MapPin className="h-4 w-4 text-accent-foreground" />
                </div>
                <div className="absolute inset-0 h-8 w-8 rounded-full bg-accent/50 animate-ping" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-card rounded-lg shadow-lg p-2 text-xs whitespace-nowrap border">
                  <p className="font-medium">{property.address}</p>
                  <p className="text-muted-foreground">{property.city}, {property.state}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlay controls */}
      <div className="absolute top-3 left-3 flex gap-2">
        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
          <MapPin className="h-3 w-3 mr-1" />
          {ownedProperties.length} Properties
        </Badge>
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <Button size="icon" variant="secondary" className="h-8 w-8 bg-background/90 backdrop-blur-sm">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" className="h-8 w-8 bg-background/90 backdrop-blur-sm">
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      {/* Expand button */}
      <Button
        onClick={() => navigate('/map')}
        variant="secondary"
        size="sm"
        className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm"
      >
        Open Full Map
      </Button>

      {/* Heatmap legend preview */}
      <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg p-2 text-xs">
        <p className="text-muted-foreground mb-1">Cap Rate</p>
        <div className="flex items-center gap-1">
          <div className="h-2 w-12 rounded-full bg-gradient-to-r from-destructive via-warning to-success" />
          <span className="text-muted-foreground">4%</span>
          <span className="text-muted-foreground ml-auto">12%+</span>
        </div>
      </div>
    </div>
  );
}
