import { Suspense } from "react";
import { getDashboardStats, getActividadReciente } from "../../../modules/dashboard/services";
import { DashboardStatsCards, DashboardQuickStats } from "../../../components/dashboard/dashboard-stats";
import { RecentActivity } from "../../../components/dashboard/recent-activity";
import { DashboardSkeleton } from "../../../components/skeletons";

async function DashboardContent() {
  const [stats, actividades] = await Promise.all([
    getDashboardStats(),
    getActividadReciente(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al Sistema de Inventario del CDs
        </p>
      </div>

      <DashboardStatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2">
        <RecentActivity actividades={actividades} />
        <DashboardQuickStats stats={stats} />
      </div>
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
