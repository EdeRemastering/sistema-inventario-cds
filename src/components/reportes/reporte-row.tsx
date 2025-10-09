import { Button } from "../ui/button";
import { DeleteButton } from "../delete-button";
import { actionDeleteReporte } from "@/modules/reportes_generados/actions";

type ReporteItem = {
  id: number;
  tipo_reporte: string;
  nombre_archivo: string;
  fecha_generacion: Date | null;
  generado_por: string | null;
};

type ReporteRowProps = {
  reporte: ReporteItem;
};

export function ReporteRow({ reporte }: ReporteRowProps) {
  return (
    <div className="flex items-center gap-4 rounded border p-4">
      <div className="flex-1">
        <h3 className="font-medium">{reporte.nombre_archivo}</h3>
        <p className="text-sm text-muted-foreground">
          Tipo: {reporte.tipo_reporte}
        </p>
        <p className="text-sm text-muted-foreground">
          Generado:{" "}
          {reporte.fecha_generacion
            ? new Date(reporte.fecha_generacion).toLocaleDateString()
            : "No especificado"}
        </p>
        <p className="text-sm text-muted-foreground">
          Por: {reporte.generado_por || "Sistema"}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Descargar
        </Button>
        <DeleteButton onConfirm={() => actionDeleteReporte(reporte.id)}>Eliminar</DeleteButton>
      </div>
    </div>
  );
}
