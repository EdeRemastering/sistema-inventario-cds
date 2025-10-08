import { listReportes } from "../../../modules/reportes_generados/services";
import {
  actionCreateReporte,
  actionDeleteReporte,
} from "../../../modules/reportes_generados/actions";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { ReporteForm } from "../../../components/reportes/reporte-form";
import { ReporteRow } from "../../../components/reportes/reporte-row";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

// Handlers para las acciones de reportes
async function handleCreateReporte(formData: FormData) {
  await actionCreateReporte(formData);
  revalidatePath("/reportes");
}

async function handleDeleteReporte(id: number) {
  await actionDeleteReporte(id);
  revalidatePath("/reportes");
}

export default async function ReportesPage() {
  const reportes = await listReportes();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reportes Generados</h1>
      <Card>
        <CardHeader>
          <ReporteForm action={handleCreateReporte} />
        </CardHeader>
        <CardContent>
          <Suspense>
            <div className="space-y-3">
              {reportes.map((r) => (
                <ReporteRow
                  key={r.id}
                  reporte={r}
                  onDelete={() => handleDeleteReporte(r.id)}
                />
              ))}
            </div>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
