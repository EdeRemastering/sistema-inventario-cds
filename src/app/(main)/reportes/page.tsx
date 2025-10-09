import { listReportes } from "../../../modules/reportes_generados/services";
import {
  actionCreateReporte,
  actionDeleteReporte,
} from "../../../modules/reportes_generados/actions";
import { ReportesList } from "../../../components/reportes/reportes-list";
import { ReporteGenerator } from "../../../components/reportes/reporte-generator";
import { ReportesSkeleton } from "../../../components/skeletons/reportes";
import { Suspense } from "react";

async function ReportesContent() {
  const reportes = await listReportes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reportes</h1>
        <p className="text-muted-foreground">
          Genera reportes en PDF de inventario, movimientos y préstamos
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReporteGenerator
          onGenerate={(tipo, datos) => {
            // Aquí se manejaría la descarga del reporte
            console.log("Generando reporte:", tipo, datos);
          }}
        />

        <ReportesList
          reportes={reportes}
          onCreateReporte={actionCreateReporte}
          onUpdateReporte={actionCreateReporte} // Usando la misma acción para crear/actualizar
          onDeleteReporte={actionDeleteReporte}
        />
      </div>
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
