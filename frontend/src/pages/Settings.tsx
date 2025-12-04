import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Globe,
  Shield,
  CreditCard,
  Key,
  Smartphone,
  Save,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ChangePasswordModal } from "@/components/modals/ChangePasswordModal";

const Settings = () => {
  const { toast } = useToast();
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('America/New_York');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [apiKey, setApiKey] = useState('sk_live_xxxxxxxxxxxxxxxxxxxxx');
  const [connectedServices, setConnectedServices] = useState({
    zillow: false,
    airdna: false,
    quickbooks: false,
    plaid: false,
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleComingSoon = () => {
    toast({
      title: "Feature Coming Soon",
      description: "This feature is to be properly implemented.",
      variant: "default",
    });
  };

  const handleCopyApiKey = async () => {
    await navigator.clipboard.writeText("sk_live_xxxxxxxxxxxxxxxxxxxxx");
    toast({
      title: "Copied!",
      description: "API key copied to clipboard.",
    });
  };

  const handlePasswordUpdate = () => {
    setChangePasswordOpen(true);
  };

  const handleRegenerateApiKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substr(2, 20);
    setApiKey(newKey);
    toast({
      title: "API Key Regenerated",
      description: "Your new API key has been generated. Make sure to save it in a secure location.",
    });
  };

  const handleIntegrationToggle = (service: string) => {
    setConnectedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }));
    const newStatus = !connectedServices[service as keyof typeof connectedServices];
    toast({
      title: newStatus ? "Service Connected" : "Service Disconnected",
      description: `${service.charAt(0).toUpperCase() + service.slice(1)} has been ${newStatus ? "connected" : "disconnected"}`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="gap-2">
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">Integrations</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="card-base">
                <h3 className="font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue="Alex Johnson" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" defaultValue="alex@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label>Company (Optional)</Label>
                    <Input defaultValue="Johnson Investments LLC" />
                  </div>
                </div>
              </div>

              <div className="card-base">
                <h3 className="font-semibold mb-4">Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handlePasswordUpdate}>Change</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="card-base">
                <h3 className="font-semibold mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  {[
                    { title: 'Deal Alerts', desc: 'New properties matching your criteria' },
                    { title: 'Market Updates', desc: 'Weekly market analysis reports' },
                    { title: 'Payment Reminders', desc: 'Upcoming mortgage and tax payments' },
                    { title: 'Lease Expirations', desc: 'Tenant lease renewal notices' },
                    { title: 'Renovation Updates', desc: 'Project milestones and completions' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-base">
                <h3 className="font-semibold mb-4">Push Notifications</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mobile Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive alerts on your mobile device</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <div className="card-base">
                <h3 className="font-semibold mb-4">Regional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="card-base">
                <h3 className="font-semibold mb-4">Display</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact View</p>
                      <p className="text-sm text-muted-foreground">Show more items in lists</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Property Photos</p>
                      <p className="text-sm text-muted-foreground">Display images in property cards</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <div className="card-base">
                <h3 className="font-semibold mb-4">Connected Services</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Zillow', key: 'zillow', icon: '🏠' },
                    { name: 'AirDNA', key: 'airdna', icon: '📊' },
                    { name: 'QuickBooks', key: 'quickbooks', icon: '📒' },
                    { name: 'Plaid', key: 'plaid', icon: '🏦' },
                  ].map((service) => {
                    const isConnected = connectedServices[service.key as keyof typeof connectedServices];
                    return (
                      <div key={service.name} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{service.icon}</span>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className={`text-sm ${isConnected ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                              {isConnected ? 'Connected' : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={isConnected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleIntegrationToggle(service.key)}
                          className={isConnected ? "btn-accent" : ""}
                        >
                          {isConnected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card-base">
                <h3 className="font-semibold mb-4">API Access</h3>
                <div className="space-y-4">
                  <div>
                    <Label>API Key</Label>
                    <div className="flex gap-2 mt-1">
                      <Input type="password" value={apiKey} readOnly />
                      <Button variant="outline" onClick={handleCopyApiKey}>Copy</Button>
                      <Button variant="outline" onClick={handleRegenerateApiKey}>Regenerate</Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Billing Management is to be properly implemented. All features below are mocked and non-functional.
                </AlertDescription>
              </Alert>

              <div className="card-base opacity-60">
                <h3 className="font-semibold mb-4">Current Plan</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">$29/month · Billed monthly</p>
                  </div>
                  <Button variant="outline" onClick={handleComingSoon} disabled>Upgrade Plan</Button>
                </div>
              </div>

              <div className="card-base opacity-60">
                <h3 className="font-semibold mb-4">Payment Method</h3>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleComingSoon} disabled>Update</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="btn-accent">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </AppLayout>
  );
};

export default Settings;
