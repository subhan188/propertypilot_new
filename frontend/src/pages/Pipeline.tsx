import { AppLayout } from "@/components/layout/AppLayout";
import { mockPipelineColumns, mockProperties } from "@/mocks/properties";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Property, PropertyStatus, PipelineColumn } from "@/types/property";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, MoreHorizontal, Plus, GripVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const columnColors: Record<PropertyStatus, string> = {
  lead: "border-t-muted-foreground",
  analyzing: "border-t-info",
  offer: "border-t-warning",
  under_contract: "border-t-accent",
  owned: "border-t-success",
  sold: "border-t-muted-foreground",
};

interface PipelineCardProps {
  property: Property;
  onClick: () => void;
}

function PipelineCard({ property, onClick }: PipelineCardProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className="bg-card rounded-xl border p-3 cursor-pointer shadow-xs hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-2">
        <div className="cursor-grab text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{property.address}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3" />
                <span>{property.city}, {property.state}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Details</DropdownMenuItem>
                <DropdownMenuItem>Analyze Deal</DropdownMenuItem>
                <DropdownMenuItem>Move to...</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-2 border-t">
            <span className="font-semibold text-sm">{formatCurrency(property.currentValue)}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {property.type}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const Pipeline = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState<PipelineColumn[]>(mockPipelineColumns);

  const totalValue = columns.reduce((acc, col) => 
    acc + col.properties.reduce((sum, p) => sum + p.currentValue, 0), 0
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <AppLayout>
      <div className="space-y-6 h-[calc(100vh-7rem)]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Deal Pipeline</h1>
            <p className="text-muted-foreground">
              {mockProperties.length} deals · {formatCurrency(totalValue)} total value
            </p>
          </div>
          <Button className="btn-accent">
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </motion.div>

        {/* Kanban Board */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 overflow-x-auto pb-4 h-full"
        >
          {columns.map((column, colIndex) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + colIndex * 0.05 }}
              className={cn(
                "flex-shrink-0 w-[300px] bg-muted/30 rounded-2xl border-t-4 flex flex-col",
                columnColors[column.id]
              )}
            >
              {/* Column Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {column.properties.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(column.properties.reduce((sum, p) => sum + p.currentValue, 0))}
                </p>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {column.properties.map((property) => (
                  <PipelineCard
                    key={property.id}
                    property={property}
                    onClick={() => navigate(`/properties/${property.id}`)}
                  />
                ))}

                {column.properties.length === 0 && (
                  <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-xl text-muted-foreground text-sm">
                    Drop deals here
                  </div>
                )}
              </div>

              {/* Add Deal Button */}
              <div className="p-3 border-t">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add deal
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Pipeline;
