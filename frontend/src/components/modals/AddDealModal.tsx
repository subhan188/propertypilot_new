import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDeal: (deal: any) => void;
  preSelectedColumn?: string;
  properties?: any[];
}

export function AddDealModal({
  open,
  onOpenChange,
  onAddDeal,
  preSelectedColumn = "lead",
  properties = [],
}: AddDealModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    propertyId: "",
    name: "",
    purchasePrice: "",
    strategy: "flip",
    exitPlan: "",
    column: preSelectedColumn,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.propertyId || !formData.name) {
      toast({
        title: "Missing Information",
        description: "Please select a property and enter a deal name",
        variant: "destructive",
      });
      return;
    }

    const newDeal = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      status: formData.column,
      createdAt: new Date().toISOString(),
    };

    onAddDeal(newDeal);

    toast({
      title: "Deal Created",
      description: `${formData.name} has been added to your pipeline`,
    });

    setFormData({
      propertyId: "",
      name: "",
      purchasePrice: "",
      strategy: "flip",
      exitPlan: "",
      column: preSelectedColumn,
    });

    onOpenChange(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="propertyId">Property *</Label>
            <Select
              value={formData.propertyId}
              onValueChange={(value) => handleChange({ target: { name: "propertyId", value } })}
            >
              <SelectTrigger id="propertyId">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.address}, {property.city} {property.state}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No properties available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">Deal Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Downtown Flip 2024"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="strategy">Strategy</Label>
              <Select
                value={formData.strategy}
                onValueChange={(value) => handleChange({ target: { name: "strategy", value } })}
              >
                <SelectTrigger id="strategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flip">Flip</SelectItem>
                  <SelectItem value="rental">Buy & Hold</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="airbnb">Short-Term Rental</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="purchasePrice">Offer Price</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                placeholder="$250,000"
                value={formData.purchasePrice}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="exitPlan">Exit Plan</Label>
            <Input
              id="exitPlan"
              name="exitPlan"
              placeholder="e.g., Sell after renovation"
              value={formData.exitPlan}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="column">Pipeline Stage</Label>
            <Select
              value={formData.column}
              onValueChange={(value) => handleChange({ target: { name: "column", value } })}
            >
              <SelectTrigger id="column">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="analyzing">Analyzing</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="under-contract">Under Contract</SelectItem>
                <SelectItem value="owned">Owned</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-accent">
              Create Deal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
