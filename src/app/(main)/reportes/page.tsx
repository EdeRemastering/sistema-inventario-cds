import { listReportes } from "../../../modules/reportes_generados/services";
import {
} from "../../../modules/reportes_generados/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { ReporteForm } from "../../../components/reportes/reporte-form";
import { ReporteRow } from "../../../components/reportes/reporte-row";
import { Suspense } from "react";

export default async function ReportesPage() {
  const reportes = await listReportes();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reportes Generados</h1>
      <Card>
        <CardHeader>
          <ReporteForm />
        </CardHeader>
        <CardContent>
          <Suspense>
            <div className="space-y-3">
              {reportes.map((r) => (
                <ReporteRow
                  key={r.id}
                  reporte={r}
                />
              ))}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
