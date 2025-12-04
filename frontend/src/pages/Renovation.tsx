import { AppLayout } from "@/components/layout/AppLayout";
import { mockProperties, mockRenovationItems } from "@/mocks/properties";
import { useState } from "react";
import { motion } from "framer-motion";
import { RenovationItem, RenovationStatus } from "@/types/property";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Camera, 
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

const statusColors: Record<RenovationStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
};

const statusIcons: Record<RenovationStatus, typeof Clock> = {
  pending: AlertCircle,
  in_progress: Clock,
  completed: CheckCircle2,
};

const Renovation = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('3');
  const [items, setItems] = useState<RenovationItem[]>(mockRenovationItems);

  const selectedProperty = mockProperties.find(p => p.id === selectedPropertyId);
  const propertyItems = items.filter(item => item.propertyId === selectedPropertyId);

  const totalEstimated = propertyItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = propertyItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  const completedItems = propertyItems.filter(item => item.status === 'completed').length;
  const progress = propertyItems.length > 0 ? (completedItems / propertyItems.length) * 100 : 0;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const propertiesWithRenovation = mockProperties.filter(p => 
    ['flip', 'under_contract'].includes(p.status) || p.type === 'flip'
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Renovation Planner</h1>
            <p className="text-muted-foreground">Track rehab projects and costs</p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {propertiesWithRenovation.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="btn-accent">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </motion.div>

        {selectedProperty && (
          <>
            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div className="card-base">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-accent" />
                  <span className="text-xs text-muted-foreground font-medium">Estimated Budget</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(totalEstimated)}</p>
              </div>
              <div className="card-base">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground font-medium">Actual Spent</span>
                </div>
                <p className="text-xl font-bold">{formatCurrency(totalActual)}</p>
                <span className={cn(
                  "text-xs",
                  totalActual <= totalEstimated ? "text-success" : "text-destructive"
                )}>
                  {totalActual <= totalEstimated ? 'Under budget' : 'Over budget'}
                </span>
              </div>
              <div className="card-base">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-info" />
                  <span className="text-xs text-muted-foreground font-medium">Progress</span>
                </div>
                <p className="text-xl font-bold">{completedItems}/{propertyItems.length}</p>
                <Progress value={progress} className="mt-2 h-2" />
              </div>
              <div className="card-base">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-warning" />
                  <span className="text-xs text-muted-foreground font-medium">Timeline</span>
                </div>
                <p className="text-xl font-bold">4 weeks</p>
                <span className="text-xs text-muted-foreground">Est. completion</span>
              </div>
            </motion.div>

            {/* Renovation Items Table */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="card-base"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead className="text-right">Estimated</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Photos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertyItems.map((item, index) => {
                    const StatusIcon = statusIcons[item.status];
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="group"
                      >
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{item.description}</p>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.contractor ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.contractor}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.estimatedCost)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {item.actualCost ? (
                            <span className={cn(
                              item.actualCost <= item.estimatedCost ? "text-success" : "text-destructive"
                            )}>
                              {formatCurrency(item.actualCost)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("gap-1", statusColors[item.status])}>
                            <StatusIcon className="h-3 w-3" />
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Camera className="h-4 w-4" />
                            <span className="text-xs">{item.photos.length || 0}</span>
                          </Button>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>

              {propertyItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No renovation items yet.</p>
                  <Button variant="link" className="mt-2">
                    <Plus className="h-4 w-4 mr-1" />
                    Add your first item
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Renovation;
