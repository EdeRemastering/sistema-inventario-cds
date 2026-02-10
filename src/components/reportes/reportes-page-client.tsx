"use client";

import { ReporteGenerator } from "./reporte-generator";
import { ReportesList } from "./reportes-list";
import type { ReporteGenerado } from "../../modules/reportes_generados/types";
import type { Ubicacion } from "../../modules/ubicaciones/types";
import type { Categoria } from "../../modules/categorias/types";
type DeleteAction = (id: number) => Promise<void>;

type Props = {
  reportes: ReporteGenerado[];
  ubicaciones: Ubicacion[];
  categorias: Categoria[];
  onDeleteReporte: DeleteAction;
};

export function ReportesPageClient({
  reportes,
  ubicaciones,
  categorias,
  onDeleteReporte,
}: Props) {
  const handleGenerate = (tipo: string, datos: string) => {
    console.log("Generando reporte:", tipo, datos);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ReporteGenerator
        onGenerate={handleGenerate}
        ubicaciones={ubicaciones}
        categorias={categorias}
      />

      <ReportesList reportes={reportes} onDeleteReporte={onDeleteReporte} />
    </div>
  );
}
