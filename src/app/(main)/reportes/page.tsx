import { listReportes } from "../../../modules/reportes_generados/services";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { ReporteUpsertDialog } from "../../../components/reportes/reporte-upsert-dialog";
import { DeleteButton } from "../../../components/delete-button";
import { ReportesSkeleton } from "../../../components/skeletons/reportes";
import { Suspense } from "react";

async function ReportesContent() {
  const reportes = await listReportes();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reportes Generados</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-end">
            <ReporteUpsertDialog
              create
              serverAction={async (fd) => {
                "use server";
                const { actionCreateReporte } = await import(
                  "../../../modules/reportes_generados/actions"
                );
                await actionCreateReporte(fd);
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportes.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded border p-3"
              >
                <div className="text-sm">
                  <div className="font-medium">{r.tipo_reporte}</div>
                  <div className="text-muted-foreground">
                    {r.nombre_archivo}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <ReporteUpsertDialog
                    create={false}
                    serverAction={async (fd) => {
                      "use server";
                      const { actionCreateReporte } = await import(
                        "../../../modules/reportes_generados/actions"
                      );
                      await actionCreateReporte(fd);
                    }}
                    defaultValues={{
                      tipo_reporte: r.tipo_reporte,
                      nombre_archivo: r.nombre_archivo,
                    }}
                    hiddenFields={{ id: r.id }}
                  />
                  <DeleteButton
                    onConfirm={async () => {
                      "use server";
                      const { actionDeleteReporte } = await import(
                        "../../../modules/reportes_generados/actions"
                      );
                      await actionDeleteReporte(r.id);
                    }}
                  >
                    Eliminar
                  </DeleteButton>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
