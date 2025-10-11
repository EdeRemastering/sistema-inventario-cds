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

export function ReporteGenerator({ onGenerate }: ReporteGeneratorProps) {
  const [tipoReporte, setTipoReporte] = useState<ReporteType>("inventario");
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
              <SelectItem value="categorias">
                Categorías y Estadísticas
              </SelectItem>
              <SelectItem value="observaciones">Observaciones</SelectItem>
              <SelectItem value="tickets">Tickets Guardados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtros de Fecha (para reportes que lo requieren) */}
        {(tipoReporte === "movimientos" ||
          tipoReporte === "observaciones" ||
          tipoReporte === "tickets") && (
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
    case "categorias":
      return "Listado de categorías con estadísticas de elementos y subcategorías";
    case "observaciones":
      return "Historial de observaciones realizadas a los elementos";
    case "tickets":
      return "Registro de tickets de préstamo guardados en el sistema";
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
    case "categorias":
      return "Nombre, descripción, estado, total elementos, total subcategorías";
    case "observaciones":
      return "Fecha, descripción, elemento, serie, marca, modelo, categoría";
    case "tickets":
      return "Ticket, fechas, elemento, dependencias, funcionarios, motivo";
    default:
      return "";
  }
}
