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

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProperty: (property: any) => void;
}

export function AddPropertyModal({
  open,
  onOpenChange,
  onAddProperty,
}: AddPropertyModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    type: "residential",
    status: "active",
    purchasePrice: "",
    currentValue: "",
    arv: "",
    sqft: "",
    bedrooms: "",
    bathrooms: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Create property object with generated ID
    const newProperty = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      currentValue: parseFloat(formData.currentValue) || 0,
      arv: parseFloat(formData.arv) || 0,
      sqft: parseFloat(formData.sqft) || 0,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      latitude: Math.random() * 180 - 90,
      longitude: Math.random() * 360 - 180,
      notes: `Added ${new Date().toLocaleDateString()}`,
    };

    onAddProperty(newProperty);

    toast({
      title: "Property Added",
      description: `${formData.address}, ${formData.city} has been added to your portfolio`,
    });

    // Reset form
    setFormData({
      address: "",
      city: "",
      state: "",
      zipCode: "",
      type: "residential",
      status: "active",
      purchasePrice: "",
      currentValue: "",
      arv: "",
      sqft: "",
      bedrooms: "",
      bathrooms: "",
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                placeholder="Austin"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                placeholder="TX"
                value={formData.state}
                onChange={handleChange}
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                name="zipCode"
                placeholder="78701"
                value={formData.zipCode}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="type">Property Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange({ target: { name: "type", value } })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="multifamily">Multifamily</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange({ target: { name: "status", value } })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Financial Information</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  placeholder="$250,000"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="currentValue">Current Value</Label>
                <Input
                  id="currentValue"
                  name="currentValue"
                  type="number"
                  placeholder="$280,000"
                  value={formData.currentValue}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="arv">After Repair Value (ARV)</Label>
                <Input
                  id="arv"
                  name="arv"
                  type="number"
                  placeholder="$350,000"
                  value={formData.arv}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Property Details</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="sqft">Square Feet</Label>
                <Input
                  id="sqft"
                  name="sqft"
                  type="number"
                  placeholder="2,500"
                  value={formData.sqft}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  placeholder="3"
                  value={formData.bedrooms}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  placeholder="2"
                  value={formData.bathrooms}
                  onChange={handleChange}
                />
              </div>
            </div>
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
              Create Property
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
