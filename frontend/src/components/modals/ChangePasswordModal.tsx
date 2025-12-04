import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "Invalid Password",
        description: "New password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      toast({
        title: "Same Password",
        description: "New password must be different from current password",
        variant: "destructive",
      });
      return;
    }

    // Mock validation: accept any current password
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully",
    });

    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({ current: false, new: false, confirm: false });

    onOpenChange(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password *</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-2.5 text-muted-foreground"
              >
                {showPasswords.current ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="newPassword">New Password *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? "text" : "password"}
                placeholder="Enter new password (min 8 characters)"
                value={formData.newPassword}
                onChange={handleChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-2.5 text-muted-foreground"
              >
                {showPasswords.new ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-2.5 text-muted-foreground"
              >
                {showPasswords.confirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Password strength indicator */}
          {formData.newPassword && (
            <div className="p-3 bg-muted rounded-md text-sm">
              <p className="font-semibold mb-1">Password strength:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded-full ${
                      formData.newPassword.length >= level * 4
                        ? "bg-accent"
                        : "bg-muted-foreground/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

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
              Update Password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
