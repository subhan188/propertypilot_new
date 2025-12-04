import { AppLayout } from "@/components/layout/AppLayout";
import { mockProperties, mockKPIData } from "@/mocks/properties";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  FileText, 
  Share2, 
  Calendar,
  TrendingUp,
  Building2,
  DollarSign,
  PieChart
} from "lucide-react";

const Reports = () => {
  const [reportType, setReportType] = useState('portfolio');
  const [timeRange, setTimeRange] = useState('ytd');

  const reportTypes = [
    { id: 'portfolio', name: 'Portfolio Summary', icon: Building2 },
    { id: 'cashflow', name: 'Cashflow Report', icon: DollarSign },
    { id: 'performance', name: 'Performance Analysis', icon: TrendingUp },
    { id: 'tax', name: 'Tax Report', icon: FileText },
  ];

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
            <h1 className="text-2xl font-bold text-foreground">Reports & Export</h1>
            <p className="text-muted-foreground">Generate and share portfolio reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
            <Button className="btn-accent">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Report Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id)}
              className={`card-base flex flex-col items-center gap-2 p-4 transition-all ${
                reportType === type.id 
                  ? 'ring-2 ring-accent border-accent' 
                  : 'hover:border-accent/50'
              }`}
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                reportType === type.id ? 'bg-accent text-accent-foreground' : 'bg-muted'
              }`}>
                <type.icon className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">{type.name}</span>
            </button>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-base flex flex-wrap gap-4"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtd">Month to Date</SelectItem>
                <SelectItem value="qtd">Quarter to Date</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              All Properties
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Rentals Only
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Flips Only
            </Badge>
          </div>
        </motion.div>

        {/* Report Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card-elevated"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Portfolio Summary Report</h2>
              <p className="text-sm text-muted-foreground">Generated for Year to Date</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>

          {/* Report Content Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Summary Stats */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Portfolio Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm">Total Properties</span>
                  <span className="font-semibold">{mockKPIData.totalProperties}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm">Portfolio Value</span>
                  <span className="font-semibold">
                    ${(mockKPIData.portfolioValue / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm">Monthly Cashflow</span>
                  <span className="font-semibold text-success">
                    ${mockKPIData.monthlyCashflow.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm">Available Equity</span>
                  <span className="font-semibold">
                    ${(mockKPIData.availableEquity / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm">Average Cap Rate</span>
                  <span className="font-semibold">7.8%</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm">YTD Return</span>
                  <span className="font-semibold text-success">+{mockKPIData.portfolioValueChange}%</span>
                </div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Allocation by Type
              </h3>
              <div className="aspect-square max-w-[240px] mx-auto relative">
                {/* Simple pie chart visualization */}
                <div className="absolute inset-0 rounded-full border-[40px] border-success" 
                  style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)' }} />
                <div className="absolute inset-0 rounded-full border-[40px] border-info" 
                  style={{ clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)' }} />
                <div className="absolute inset-0 rounded-full border-[40px] border-warning" 
                  style={{ clipPath: 'polygon(50% 50%, 50% 100%, 0% 100%, 0% 0%, 50% 0%)' }} />
                <div className="absolute inset-8 rounded-full bg-card flex items-center justify-center">
                  <PieChart className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success" />
                  <span>Rental (50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-info" />
                  <span>Airbnb (30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-warning" />
                  <span>Flip (20%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Table Preview */}
          <div className="mt-8">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-4">
              Property Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Property</th>
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-right py-2 font-medium">Value</th>
                    <th className="text-right py-2 font-medium">Equity</th>
                    <th className="text-right py-2 font-medium">Monthly NOI</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProperties.filter(p => p.status === 'owned').slice(0, 5).map((property) => (
                    <tr key={property.id} className="border-b">
                      <td className="py-2">
                        <div>
                          <p className="font-medium">{property.address}</p>
                          <p className="text-xs text-muted-foreground">{property.city}, {property.state}</p>
                        </div>
                      </td>
                      <td className="py-2 capitalize">{property.type}</td>
                      <td className="py-2 text-right font-mono">
                        ${property.currentValue.toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-mono text-success">
                        ${(property.currentValue - property.purchasePrice).toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-mono">
                        ${Math.round(property.currentValue * 0.006).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Reports;
