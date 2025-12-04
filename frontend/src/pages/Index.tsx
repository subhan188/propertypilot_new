import { AppLayout } from "@/components/layout/AppLayout";
import { KPIChip } from "@/components/ui/kpi-chip";
import { PropertyCard } from "@/components/ui/property-card";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { MapPreview } from "@/components/dashboard/MapPreview";
import { QuickScenarios } from "@/components/dashboard/QuickScenarios";
import { mockProperties, mockKPIData, mockAlerts } from "@/mocks/properties";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, TrendingUp, Wallet, Activity, Home, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(mockAlerts);
  
  const ownedProperties = mockProperties.filter(p => p.status === 'owned');
  const activeDeals = mockProperties.filter(p => ['analyzing', 'offer', 'under_contract'].includes(p.status));

  // Calculate Zillow market insights
  const propertiesWithZestimate = mockProperties.filter(p => p.zestimate);
  const totalZestimate = propertiesWithZestimate.reduce((sum, p) => sum + (p.zestimate || 0), 0);
  const avgZestimate = propertiesWithZestimate.length > 0
    ? totalZestimate / propertiesWithZestimate.length
    : 0;

  const marketValueVsPurchase = propertiesWithZestimate.reduce((sum, p) => {
    return sum + ((p.zestimate || 0) - p.purchasePrice);
  }, 0);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your portfolio overview.</p>
          </div>
        </motion.div>

        {/* KPI Strip - Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:hidden gap-3"
        >
          <div className="card-base flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Properties</p>
              <p className="text-lg font-bold">{mockKPIData.totalProperties}</p>
            </div>
          </div>
          <div className="card-base flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Deals</p>
              <p className="text-lg font-bold">{mockKPIData.activeDeals}</p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Map & KPIs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Map Preview */}
            <div className="card-base p-0 overflow-hidden">
              <MapPreview properties={mockProperties} className="h-[300px] lg:h-[400px]" />
            </div>

            {/* Portfolio Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-base">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-accent" />
                  <span className="text-xs text-muted-foreground font-medium">Portfolio Value</span>
                </div>
                <p className="text-xl font-bold">
                  ${(mockKPIData.portfolioValue / 1000000).toFixed(2)}M
                </p>
                <span className="text-xs text-success">+{mockKPIData.portfolioValueChange}%</span>
              </div>
              <div className="card-base">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-xs text-muted-foreground font-medium">Monthly Cashflow</span>
                </div>
                <p className="text-xl font-bold">
                  ${mockKPIData.monthlyCashflow.toLocaleString()}
                </p>
                <span className="text-xs text-success">+{mockKPIData.cashflowChange}%</span>
              </div>
              <div className="card-base">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-info" />
                  <span className="text-xs text-muted-foreground font-medium">Available Equity</span>
                </div>
                <p className="text-xl font-bold">
                  ${(mockKPIData.availableEquity / 1000000).toFixed(2)}M
                </p>
                <span className="text-xs text-success">+{mockKPIData.equityChange}%</span>
              </div>
              <div className="card-base">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-warning" />
                  <span className="text-xs text-muted-foreground font-medium">Avg Cap Rate</span>
                </div>
                <p className="text-xl font-bold">7.8%</p>
                <span className="text-xs text-muted-foreground">Portfolio avg</span>
              </div>
            </div>

            {/* Market Insights from Zillow */}
            {propertiesWithZestimate.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-foreground">Market Insights</h3>
                  </div>
                  <Badge variant="outline" className="bg-blue-100/50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                    Via Zillow
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/40 dark:bg-blue-900/10 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total Zestimate</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      ${(totalZestimate / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {propertiesWithZestimate.length} properties tracked
                    </p>
                  </div>

                  <div className="bg-white/40 dark:bg-blue-900/10 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Market Gain</p>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-2xl font-bold ${
                        marketValueVsPurchase > 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        ${Math.abs(marketValueVsPurchase / 1000000).toFixed(2)}M
                      </p>
                      {marketValueVsPurchase > 0 ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      vs. purchase prices
                    </p>
                  </div>

                  <div className="bg-white/40 dark:bg-blue-900/10 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Average Zestimate</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      ${(avgZestimate / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      per property
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground bg-white/20 dark:bg-blue-900/5 rounded p-3">
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <p>Market values refreshed from Zillow. <a href="/properties" className="text-accent hover:underline">View details →</a></p>
                </div>
              </motion.div>
            )}

            {/* Recent Properties */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Your Properties</h2>
                <button 
                  onClick={() => navigate('/properties')}
                  className="text-sm text-accent hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ownedProperties.slice(0, 4).map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <PropertyCard
                      property={property}
                      onClick={() => navigate(`/properties/${property.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Alerts & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Quick Scenarios */}
            <div className="card-base">
              <QuickScenarios />
            </div>

            {/* Active Deals */}
            <div className="card-base">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Active Deals</h3>
                <span className="text-xs text-muted-foreground">{activeDeals.length} deals</span>
              </div>
              <div className="space-y-2">
                {activeDeals.slice(0, 4).map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    variant="compact"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  />
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="card-base">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Alerts</h3>
                <span className="text-xs text-muted-foreground">
                  {alerts.filter(a => !a.read).length} unread
                </span>
              </div>
              <AlertsList alerts={alerts} onDismiss={dismissAlert} />
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
