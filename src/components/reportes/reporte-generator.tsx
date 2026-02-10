"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { generateReport, type ReporteType } from "../../lib/report-handler";

type ReporteGeneratorProps = {
  onGenerate: (tipo: string, datos: string) => void;
};

export function ReporteGenerator({ onGenerate }: ReporteGeneratorProps) {
  const [tipoReporte] = useState<ReporteType>("tickets");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [generando, setGenerando] = useState(false);

  const handleGenerar = async (formato: "pdf" | "excel") => {
    setGenerando(true);

    try {
      const result = await generateReport(
        tipoReporte,
        formato,
        fechaInicio || undefined,
        fechaFin || undefined
      );

      if (result.success) {
        toast.success(result.message);
        onGenerate(tipoReporte, "reporte_generado");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error generando reporte:", error);
      toast.error("Error al generar el reporte");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generador de Reportes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tipo de Reporte - solo tickets */}
        <div className="grid gap-2">
          <Label>Tipo de Reporte</Label>
          <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm bg-muted/50">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Tickets Guardados
          </div>
        </div>

        {/* Filtros de Fecha */}
        <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha-fin">Fecha Fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>

        {/* Botones de Acción */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleGenerar("pdf")}
            disabled={generando}
            className="flex-1"
          >
            {generando ? (
              "Generando..."
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generar PDF
              </>
            )}
          </Button>

          <Button
            onClick={() => handleGenerar("excel")}
            disabled={generando}
            variant="outline"
            className="flex-1"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Información del Reporte */}
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Tipo:</strong> {getReporteDescription(tipoReporte)}
          </p>
          <p>
            <strong>Formatos:</strong> PDF y CSV (compatible con Excel)
          </p>
          <p>
            <strong>Incluye:</strong> {getReporteIncludes(tipoReporte)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getReporteDescription(_tipo: ReporteType): string {
  return "Registro de tickets de préstamo guardados en el sistema";
}

function getReporteIncludes(_tipo: ReporteType): string {
  return "Ticket, fechas, elemento, dependencias, funcionarios, motivo";
}
