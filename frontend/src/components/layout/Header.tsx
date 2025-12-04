import { cn } from "@/lib/utils";
import { KPIChip } from "@/components/ui/kpi-chip";
import { mockKPIData } from "@/mocks/properties";
import {
  Search,
  Bell,
  Plus,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { QuickCaptureModal } from "@/components/modals/QuickCaptureModal";

interface HeaderProps {
  sidebarCollapsed?: boolean;
}

export function Header({ sidebarCollapsed }: HeaderProps) {
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "transition-[left] duration-200",
          sidebarCollapsed ? "left-[72px]" : "left-[240px]"
        )}
      >
        <div className="flex h-full items-center justify-between px-6">
          {/* Left: Search */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search address or APN..."
                className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Center: KPI Chips */}
          <div className="hidden lg:flex items-center gap-3">
            <KPIChip
              label="Portfolio"
              value={mockKPIData.portfolioValue}
              change={mockKPIData.portfolioValueChange}
              format="currency"
              size="sm"
            />
            <KPIChip
              label="Cashflow"
              value={mockKPIData.monthlyCashflow}
              change={mockKPIData.cashflowChange}
              format="currency"
              size="sm"
            />
            <KPIChip
              label="Equity"
              value={mockKPIData.availableEquity}
              change={mockKPIData.equityChange}
              format="currency"
              size="sm"
            />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                2
              </span>
            </Button>

            <Button
              onClick={() => setQuickCaptureOpen(true)}
              size="sm"
              className="btn-accent gap-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Capture</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <QuickCaptureModal 
        open={quickCaptureOpen} 
        onOpenChange={setQuickCaptureOpen} 
      />
    </>
  );
}
