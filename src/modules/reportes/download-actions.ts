"use client";

import { 
  generateInventarioReport, 
  generateMovimientosReport, 
  generatePrestamosActivosReport
} from "../../lib/report-generator";
import { actionCreateReporteGenerado } from "../reportes_generados/actions";

// Funciones para obtener datos desde las API routes
async function fetchInventarioData() {
  const response = await fetch('/api/reportes/inventario');
  if (!response.ok) throw new Error('Error al obtener datos de inventario');
  return response.json();
}

async function fetchMovimientosData(fechaInicio?: string, fechaFin?: string) {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);
  
  const response = await fetch(`/api/reportes/movimientos?${params.toString()}`);
  if (!response.ok) throw new Error('Error al obtener datos de movimientos');
  return response.json();
}

async function fetchPrestamosActivosData() {
  const response = await fetch('/api/reportes/prestamos-activos');
  if (!response.ok) throw new Error('Error al obtener datos de préstamos activos');
  return response.json();
}

/**
 * Descarga directamente un PDF y lo guarda como historial simple
 */
export async function actionDownloadPDF(
  tipoReporte: string,
  fechaInicio?: string,
  fechaFin?: string
) {
  try {
    let datos: any;
    let nombreArchivo: string;

    // Obtener datos según el tipo de reporte
    switch (tipoReporte) {
      case "inventario":
        datos = await fetchInventarioData();
        nombreArchivo = `inventario_completo_${new Date().toISOString().split('T')[0]}.pdf`;
        break;

      case "movimientos":
        datos = await fetchMovimientosData(fechaInicio, fechaFin);
        nombreArchivo = `movimientos_${fechaInicio ? new Date(fechaInicio).toISOString().split('T')[0] : 'todos'}.pdf`;
        break;

      case "prestamos-activos":
        datos = await fetchPrestamosActivosData();
        nombreArchivo = `prestamos_activos_${new Date().toISOString().split('T')[0]}.pdf`;
        break;

      default:
        return { success: false, message: "Tipo de reporte no válido para PDF" };
    }

    // Generar PDF
    let pdfData: string;
    switch (tipoReporte) {
      case "inventario":
        pdfData = await generateInventarioReport(datos);
        break;
      case "movimientos":
        pdfData = await generateMovimientosReport(datos);
        break;
      case "prestamos-activos":
        pdfData = await generatePrestamosActivosReport(datos);
        break;
      default:
        throw new Error("Tipo de reporte no válido");
    }

    // Descargar el PDF directamente
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Guardar en historial (solo el registro, sin el archivo)
    const saveResult = await actionCreateReporteGenerado({
      tipo_reporte: tipoReporte,
      nombre_archivo: nombreArchivo,
      contenido_pdf: new Uint8Array(), // Vacío, solo es historial
      generado_por: "Usuario"
    });

    if (!saveResult.success) {
      console.warn("No se pudo guardar en historial:", saveResult.message);
    }

    return { success: true, message: `PDF ${nombreArchivo} descargado exitosamente` };

  } catch (error) {
    console.error("Error descargando PDF:", error);
    return { success: false, message: "Error al descargar el PDF" };
  }
}

