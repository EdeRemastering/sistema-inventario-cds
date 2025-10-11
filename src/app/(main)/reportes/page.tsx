import { listReportes } from "../../../modules/reportes_generados/services";
import { actionDeleteReporte } from "../../../modules/reportes_generados/actions";
import { getReporteStats } from "../../../modules/reportes/services";
import { ReportesPageClient } from "../../../components/reportes/reportes-page-client";
import { ReporteStats } from "../../../components/reportes/reporte-stats";
import { ReportesSkeleton } from "../../../components/skeletons/reportes";
import { Suspense } from "react";

async function ReportesContent() {
  const [reportes, stats] = await Promise.all([
    listReportes(),
    getReporteStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reportes</h1>
        <p className="text-muted-foreground">
          Genera reportes en PDF y Excel de inventario, movimientos y préstamos
        </p>
      </div>

      <ReporteStats stats={stats} />

      <ReportesPageClient
        reportes={reportes}
        onDeleteReporte={actionDeleteReporte}
      />
    </div>
  );
}

export default function ReportesPage() {
  return (
    <Suspense fallback={<ReportesSkeleton />}>
      <ReportesContent />
    </Suspense>
  );
}
