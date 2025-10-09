import { listReportes } from "../../../modules/reportes_generados/services";
import {
  actionCreateReporte,
  actionDeleteReporte,
} from "../../../modules/reportes_generados/actions";
import { ReportesList } from "../../../components/reportes/reportes-list";
import { ReportesSkeleton } from "../../../components/skeletons/reportes";
import { Suspense } from "react";

async function ReportesContent() {
  const reportes = await listReportes();

  return (
    <ReportesList
      reportes={reportes}
      onCreateReporte={actionCreateReporte}
      onUpdateReporte={actionCreateReporte} // Usando la misma acción para crear/actualizar
      onDeleteReporte={actionDeleteReporte}
    />
  );
}

export default function ReportesPage() {
  return (
    <Suspense fallback={<ReportesSkeleton />}>
      <ReportesContent />
    </Suspense>
  );
}
