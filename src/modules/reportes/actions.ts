"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { 
  generateInventarioReport, 
  generateMovimientosReport, 
  generatePrestamosActivosReport,
  exportInventarioToExcel,
  exportMovimientosToExcel,
  exportPrestamosActivosToExcel,
  exportToExcel
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

    switch (tipoReporte) {
      case "inventario":
        datos = await getInventarioReporteData();
        if (formato === "pdf") {
          reporteData = await generateInventarioReport(datos);
          nombreArchivo = `inventario_completo_${new Date().toISOString().split('T')[0]}.pdf`;
        } else {
          exportInventarioToExcel(datos);
          return { success: true, message: "Reporte de inventario exportado exitosamente" };
        }
        break;

      case "movimientos":
        datos = await getMovimientosReporteData(fechaInicioDate, fechaFinDate);
        if (formato === "pdf") {
          reporteData = await generateMovimientosReport(datos);
          nombreArchivo = `movimientos_${fechaInicioDate ? fechaInicioDate.toISOString().split('T')[0] : 'todos'}.pdf`;
        } else {
          exportMovimientosToExcel(datos);
          return { success: true, message: "Reporte de movimientos exportado exitosamente" };
        }
        break;

      case "prestamos-activos":
        datos = await getPrestamosActivosReporteData();
        if (formato === "pdf") {
          reporteData = await generatePrestamosActivosReport(datos);
          nombreArchivo = `prestamos_activos_${new Date().toISOString().split('T')[0]}.pdf`;
        } else {
          exportPrestamosActivosToExcel(datos);
          return { success: true, message: "Reporte de préstamos activos exportado exitosamente" };
        }
        break;

      case "categorias":
        datos = await getCategoriasReporteData();
        if (formato === "excel") {
          const excelData = datos.map(cat => ({
            'ID': cat.id,
            'Nombre': cat.nombre,
            'Descripción': cat.descripcion,
            'Estado': cat.estado,
            'Total Elementos': cat.total_elementos,
            'Total Subcategorías': cat.total_subcategorias,
            'Creado': cat.creado_en.toLocaleDateString()
          }));
          exportToExcel(excelData, `categorias_${new Date().toISOString().split('T')[0]}.csv`);
          return { success: true, message: "Reporte de categorías exportado exitosamente" };
        }
        // Para PDF de categorías, usaríamos un generador específico
        return { success: false, message: "Formato PDF para categorías no implementado aún" };

      case "observaciones":
        datos = await getObservacionesReporteData(fechaInicioDate, fechaFinDate);
        if (formato === "excel") {
          const excelData = datos.map(obs => ({
            'ID': obs.id,
            'Fecha Observación': obs.fecha_observacion.toLocaleDateString(),
            'Descripción': obs.descripcion,
            'Elemento Serie': obs.elemento_serie,
            'Elemento Marca': obs.elemento_marca,
            'Elemento Modelo': obs.elemento_modelo,
            'Categoría': obs.elemento_categoria,
            'Creado': obs.creado_en.toLocaleDateString()
          }));
          exportToExcel(excelData, `observaciones_${fechaInicioDate ? fechaInicioDate.toISOString().split('T')[0] : 'todos'}.csv`);
          return { success: true, message: "Reporte de observaciones exportado exitosamente" };
        }
        return { success: false, message: "Formato PDF para observaciones no implementado aún" };

      case "tickets":
        datos = await getTicketsReporteData(fechaInicioDate, fechaFinDate);
        if (formato === "excel") {
          const excelData = datos.map(ticket => ({
            'ID': ticket.id,
            'Número Ticket': ticket.numero_ticket,
            'Fecha Salida': ticket.fecha_salida.toLocaleDateString(),
            'Fecha Est. Devolución': ticket.fecha_estimada_devolucion?.toLocaleDateString() || 'N/A',
            'Elemento': ticket.elemento,
            'Serie': ticket.serie,
            'Marca/Modelo': ticket.marca_modelo,
            'Cantidad': ticket.cantidad,
            'Dependencia Entrega': ticket.dependencia_entrega,
            'Dependencia Recibe': ticket.dependencia_recibe,
            'Motivo': ticket.motivo,
            'Orden Número': ticket.orden_numero,
            'Usuario Guardado': ticket.usuario_guardado
          }));
          exportToExcel(excelData, `tickets_${fechaInicioDate ? fechaInicioDate.toISOString().split('T')[0] : 'todos'}.csv`);
          return { success: true, message: "Reporte de tickets exportado exitosamente" };
        }
        return { success: false, message: "Formato PDF para tickets no implementado aún" };

      default:
        return { success: false, message: "Tipo de reporte no válido" };
    }

    // Si es PDF, guardar en la base de datos
    if (formato === "pdf" && reporteData) {
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

    return { success: true, message: "Reporte generado exitosamente" };

  } catch (error) {
    console.error("Error generando reporte:", error);
    return { success: false, message: "Error al generar el reporte" };
  }
}
