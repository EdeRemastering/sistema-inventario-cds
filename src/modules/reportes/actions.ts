"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { 
  generateInventarioReport, 
  generateMovimientosReport, 
  generatePrestamosActivosReport
} from "../../lib/report-generator";
import {
  getInventarioReporteData,
  getMovimientosReporteData,
  getPrestamosActivosReporteData,
  getCategoriasReporteData,
  getObservacionesReporteData,
  getTicketsReporteData
} from "./services";
import { createReporte } from "../reportes_generados/services";

export async function actionGenerateReporte(formData: FormData) {
  const tipoReporte = formData.get("tipo_reporte") as string;
  const fechaInicio = formData.get("fecha_inicio") as string;
  const fechaFin = formData.get("fecha_fin") as string;
  const formato = formData.get("formato") as string;

  try {
    let reporteData: string;
    let nombreArchivo: string;
    let datos: any;

    // Convertir fechas si se proporcionan
    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
    const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;

    // Solo manejar PDFs en el servidor
    if (formato !== "pdf") {
      return { success: false, message: "Esta acción solo maneja PDFs. Use la exportación a Excel desde el cliente." };
    }

    switch (tipoReporte) {
      case "inventario":
        datos = await getInventarioReporteData();
        reporteData = await generateInventarioReport(datos);
        nombreArchivo = `inventario_completo_${new Date().toISOString().split('T')[0]}.pdf`;
        break;

      case "movimientos":
        datos = await getMovimientosReporteData(fechaInicioDate, fechaFinDate);
        reporteData = await generateMovimientosReport(datos);
        nombreArchivo = `movimientos_${fechaInicioDate ? fechaInicioDate.toISOString().split('T')[0] : 'todos'}.pdf`;
        break;

      case "prestamos-activos":
        datos = await getPrestamosActivosReporteData();
        reporteData = await generatePrestamosActivosReport(datos);
        nombreArchivo = `prestamos_activos_${new Date().toISOString().split('T')[0]}.pdf`;
        break;

      case "categorias":
      case "observaciones":
      case "tickets":
        return { success: false, message: "Formato PDF para este tipo de reporte no implementado aún" };

      default:
        return { success: false, message: "Tipo de reporte no válido" };
    }

    // Guardar PDF en la base de datos
    if (reporteData) {
      // Convertir data URI a Buffer
      const base64Data = reporteData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      await createReporte({
        tipo_reporte: tipoReporte,
        nombre_archivo: nombreArchivo,
        contenido_pdf: buffer,
        generado_por: "Sistema"
      });

      revalidatePath("/reportes");
      return { success: true, message: `Reporte ${nombreArchivo} generado exitosamente` };
    }

    return { success: false, message: "Error al generar el reporte PDF" };

  } catch (error) {
    console.error("Error generando reporte:", error);
    return { success: false, message: "Error al generar el reporte" };
  }
}
