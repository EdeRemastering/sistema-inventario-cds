"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { generateReport, type ReporteType } from "../../lib/report-handler";

type ReporteGeneratorProps = {
  onGenerate: (tipo: string, datos: string) => void;
};

const reporteOptions: { value: ReporteType; label: string }[] = [
  { value: "tickets", label: "Tickets Guardados" },
  { value: "inventario", label: "Inventario Completo" },
  { value: "prestamos-activos", label: "Pr\u00e9stamos Activos" },
  { value: "categorias", label: "Categor\u00edas" },
  { value: "observaciones", label: "Observaciones" },
];

function getReporteDescription(tipo: ReporteType): string {
  const descriptions: Record<ReporteType, string> = {
    inventario: "Listado completo de elementos del inventario",
    movimientos: "Registro de movimientos (salidas y devoluciones)",
    "prestamos-activos": "Elementos actualmente prestados",
    categorias: "Resumen por categor\u00edas y subcategor\u00edas",
    observaciones: "Observaciones registradas en elementos",
    tickets: "Registro de tickets de pr\u00e9stamo guardados en el sistema",
  };
  return descriptions[tipo];
}

function getReporteIncludes(tipo: ReporteType): string {
  const includes: Record<ReporteType, string> = {
    inventario: "Serie, marca, modelo, ubicaci\u00f3n, estado, categor\u00eda",
    movimientos: "Fecha, tipo, elemento, ubicaci\u00f3n, responsable",
    "prestamos-activos": "Elemento, fecha salida, ubicaci\u00f3n, responsable",
    categorias: "Categor\u00eda, subcategor\u00edas, cantidad de elementos",
    observaciones: "Elemento, fecha, descripci\u00f3n de la observaci\u00f3n",
    tickets: "Ticket, fechas, elemento, dependencias, funcionarios, motivo",
  };
  return includes[tipo];
}

export function ReporteGenerator({ onGenerate }: ReporteGeneratorProps) {
  const [tipoReporte, setTipoReporte] = useState<ReporteType>("tickets");
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
        {/* Tipo de Reporte */}
        <div className="grid gap-2">
          <Label>Tipo de Reporte</Label>
          <Select
            value={tipoReporte}
            onValueChange={(v) => setTipoReporte(v as ReporteType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona tipo de reporte" />
            </SelectTrigger>
            <SelectContent>
              {reporteOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        {/* Botones de Acci\u00f3n */}
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

        {/* Informaci\u00f3n del Reporte */}
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
