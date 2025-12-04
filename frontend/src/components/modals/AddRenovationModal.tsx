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

interface AddRenovationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRenovation: (renovation: any) => void;
}

export function AddRenovationModal({
  open,
  onOpenChange,
  onAddRenovation,
}: AddRenovationModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: "structural",
    description: "",
    estimatedCost: "",
    actualCost: "",
    status: "planned",
    contractor: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.estimatedCost) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newRenovation = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      estimatedCost: parseFloat(formData.estimatedCost) || 0,
      actualCost: formData.actualCost ? parseFloat(formData.actualCost) : undefined,
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
      notes: `Added ${new Date().toLocaleDateString()}`,
    };

    onAddRenovation(newRenovation);

    toast({
      title: "Renovation Item Added",
      description: `${formData.description} has been added to your project`,
    });

    setFormData({
      category: "structural",
      description: "",
      estimatedCost: "",
      actualCost: "",
      status: "planned",
      contractor: "",
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
          <DialogTitle>Add Renovation Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange({ target: { name: "category", value } })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="structural">Structural</SelectItem>
                  <SelectItem value="roof">Roof</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="flooring">Flooring</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="painting">Painting</SelectItem>
                  <SelectItem value="landscaping">Landscaping</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange({ target: { name: "status", value } })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              name="description"
              placeholder="e.g., Replace kitchen cabinets and countertops"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedCost">Estimated Cost *</Label>
              <Input
                id="estimatedCost"
                name="estimatedCost"
                type="number"
                placeholder="$5,000"
                value={formData.estimatedCost}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="actualCost">Actual Cost</Label>
              <Input
                id="actualCost"
                name="actualCost"
                type="number"
                placeholder="$5,500"
                value={formData.actualCost}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contractor">Contractor</Label>
            <Input
              id="contractor"
              name="contractor"
              placeholder="e.g., ABC Contractors"
              value={formData.contractor}
              onChange={handleChange}
            />
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
              Add Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
