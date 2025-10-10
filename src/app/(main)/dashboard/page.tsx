import { Suspense } from "react";
import { CDSLogo } from "../../../components/ui/cds-logo";
import {
  getDashboardStats,
  getActividadReciente,
} from "../../../modules/dashboard/services";
import {
  DashboardStatsCards,
  DashboardQuickStats,
} from "../../../components/dashboard/dashboard-stats";
import { RecentActivity } from "../../../components/dashboard/recent-activity";
import { LowStockAlerts } from "../../../components/dashboard/low-stock-alerts";
import { AdvancedCharts } from "../../../components/dashboard/advanced-charts";
import { DashboardSkeleton } from "../../../components/skeletons";

async function DashboardContent() {
  const [stats, actividades] = await Promise.all([
    getDashboardStats(),
    getActividadReciente(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <CDSLogo size="lg" showText={false} />
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido al Sistema de Inventario del CDs
          </p>
        </div>
      </div>

      <DashboardStatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RecentActivity actividades={actividades} />
        <DashboardQuickStats stats={stats} />
        <LowStockAlerts />
      </div>

      <AdvancedCharts stats={stats} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
