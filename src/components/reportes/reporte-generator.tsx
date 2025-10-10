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
import {
  generateInventarioReport,
  generateMovimientosReport,
  generatePrestamosActivosReport,
  exportInventarioToExcel,
  exportMovimientosToExcel,
  exportPrestamosActivosToExcel,
  type InventarioReporteData,
  type MovimientosReporteData,
  type PrestamosActivosReporteData,
} from "../../lib/report-generator";

type ReporteType = "inventario" | "movimientos" | "prestamos-activos";

type ReporteGeneratorProps = {
  onGenerate: (tipo: string, datos: string) => void;
};

export function ReporteGenerator({ onGenerate }: ReporteGeneratorProps) {
  const [tipoReporte, setTipoReporte] = useState<ReporteType>("inventario");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [generando, setGenerando] = useState(false);

  const handleGenerar = async () => {
    setGenerando(true);

    try {
      let reporteData: string;

      switch (tipoReporte) {
        case "inventario":
          // Aquí harías la llamada a la API para obtener los datos del inventario
          const inventarioData: InventarioReporteData = {
            elementos: [], // Datos reales vendrían de la API
          };
          reporteData = await generateInventarioReport(inventarioData);
          break;

        case "movimientos":
          // Aquí harías la llamada a la API para obtener los movimientos
          const movimientosData: MovimientosReporteData = {
            movimientos: [], // Datos reales vendrían de la API
          };
          reporteData = await generateMovimientosReport(movimientosData);
          break;

        case "prestamos-activos":
          // Aquí harías la llamada a la API para obtener los préstamos activos
          const prestamosData: PrestamosActivosReporteData = {
            prestamos: [], // Datos reales vendrían de la API
          };
          reporteData = await generatePrestamosActivosReport(prestamosData);
          break;

        default:
          throw new Error("Tipo de reporte no válido");
      }

      onGenerate(tipoReporte, reporteData);
      toast.success("Reporte generado exitosamente");
    } catch (error) {
      console.error("Error generando reporte:", error);
      toast.error("Error al generar el reporte");
    } finally {
      setGenerando(false);
    }
  };

  const handleExportExcel = async () => {
    setGenerando(true);

    try {
      let result: string;

      switch (tipoReporte) {
        case "inventario":
          const inventarioData: InventarioReporteData = {
            elementos: [], // Datos reales vendrían de la API
          };
          result = exportInventarioToExcel(inventarioData);
          break;

        case "movimientos":
          const movimientosData: MovimientosReporteData = {
            movimientos: [], // Datos reales vendrían de la API
          };
          result = exportMovimientosToExcel(movimientosData);
          break;

        case "prestamos-activos":
          const prestamosData: PrestamosActivosReporteData = {
            prestamos: [], // Datos reales vendrían de la API
          };
          result = exportPrestamosActivosToExcel(prestamosData);
          break;

        default:
          throw new Error("Tipo de reporte no válido");
      }

      toast.success(result);
    } catch (error) {
      console.error("Error exportando a Excel:", error);
      toast.error("Error al exportar a Excel");
    } finally {
      setGenerando(false);
    }
  };

  // const descargarReporte = (data: string, filename: string) => {
  //   const link = document.createElement('a');
  //   link.href = data;
  //   link.download = filename;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

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
          <Label htmlFor="tipo-reporte">Tipo de Reporte</Label>
          <Select
            value={tipoReporte}
            onValueChange={(value: ReporteType) => setTipoReporte(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo de reporte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inventario">Inventario Completo</SelectItem>
              <SelectItem value="movimientos">Movimientos Recientes</SelectItem>
              <SelectItem value="prestamos-activos">
                Préstamos Activos
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtros de Fecha (solo para algunos reportes) */}
        {tipoReporte !== "inventario" && (
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
        )}

        {/* Botones de Acción */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerar}
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
            onClick={handleExportExcel}
            disabled={generando}
            variant="outline"
            className="flex-1"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>

        {/* Información del Reporte */}
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Tipo:</strong> {getReporteDescription(tipoReporte)}
          </p>
          <p>
            <strong>Formato:</strong> PDF
          </p>
          <p>
            <strong>Incluye:</strong> {getReporteIncludes(tipoReporte)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function getReporteDescription(tipo: ReporteType): string {
  switch (tipo) {
    case "inventario":
      return "Listado completo de todos los elementos del inventario";
    case "movimientos":
      return "Historial de todos los movimientos de entrada y salida";
    case "prestamos-activos":
      return "Elementos actualmente en préstamo que no han sido devueltos";
    default:
      return "";
  }
}

function getReporteIncludes(tipo: ReporteType): string {
  switch (tipo) {
    case "inventario":
      return "Serie, marca, modelo, cantidad, ubicación, estados, categorías";
    case "movimientos":
      return "Ticket, fecha, tipo, elemento, funcionarios, fechas de devolución";
    case "prestamos-activos":
      return "Ticket, elemento, funcionario, fecha de préstamo, fecha estimada de devolución";
    default:
      return "";
  }
}
