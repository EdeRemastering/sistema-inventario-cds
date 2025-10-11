"use client";

import { ReporteGenerator } from "./reporte-generator";
import { ReportesList } from "./reportes-list";
import type { ReporteGenerado } from "../../modules/reportes_generados/types";
type DeleteAction = (id: number) => Promise<void>;

type Props = {
  reportes: ReporteGenerado[];
  onDeleteReporte: DeleteAction;
};

export function ReportesPageClient({ reportes, onDeleteReporte }: Props) {
  const handleGenerate = (tipo: string, datos: string) => {
    // Aquí se manejaría la descarga del reporte
    console.log("Generando reporte:", tipo, datos);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ReporteGenerator onGenerate={handleGenerate} />

      <ReportesList reportes={reportes} onDeleteReporte={onDeleteReporte} />
    </div>
  );
}
