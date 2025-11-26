"use client";

import { 
  generateInventarioReport as generateInventarioPDF, 
  generateMovimientosReport as generateMovimientosPDF, 
  generatePrestamosActivosReport as generatePrestamosPDF,
  generateCategoriasReport as generateCategoriasPDF,
  generateObservacionesReport as generateObservacionesPDF,
  generateTicketsReport as generateTicketsPDF,
  exportInventarioToExcel,
  exportMovimientosToExcel,
  exportPrestamosActivosToExcel,
  exportCategoriasToExcel,
  exportObservacionesToExcel,
  exportTicketsToExcel,
} from "./report-generator";
import { actionCreateReporteGenerado } from "../modules/reportes_generados/actions";
import type { InventarioReporteData, MovimientosReporteData, PrestamosActivosReporteData, CategoriasReporteData, ObservacionesReporteData, TicketsReporteData } from "./report-generator";

// Tipos de reporte disponibles
export type ReporteType = 
  | "inventario"
  | "movimientos" 
  | "prestamos-activos"
  | "categorias"
  | "observaciones"
  | "tickets";

// Función para obtener datos usando actions
async function fetchReportData(
  tipoReporte: ReporteType, 
  fechaInicio?: string, 
  fechaFin?: string
) {
  const { 
    actionGetInventarioReporteData,
    actionGetMovimientosReporteData,
    actionGetPrestamosActivosReporteData,
    actionGetCategoriasReporteData,
    actionGetObservacionesReporteData,
    actionGetTicketsReporteData
  } = await import("../modules/reportes/actions");
  
  const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
  const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;
  
  switch (tipoReporte) {
    case 'inventario':
      return await actionGetInventarioReporteData();
    case 'movimientos':
      return await actionGetMovimientosReporteData(fechaInicioDate, fechaFinDate);
    case 'prestamos-activos':
      return await actionGetPrestamosActivosReporteData();
    case 'categorias':
      return await actionGetCategoriasReporteData();
    case 'observaciones':
      return await actionGetObservacionesReporteData(fechaInicioDate, fechaFinDate);
    case 'tickets':
      return await actionGetTicketsReporteData(fechaInicioDate, fechaFinDate);
    default:
      throw new Error(`Tipo de reporte no válido: ${tipoReporte}`);
  }
}

// Función para generar nombre de archivo
function generateFileName(tipoReporte: ReporteType, formato: 'pdf' | 'excel', fechaInicio?: string): string {
  const fecha = new Date().toISOString().split('T')[0];
  const fechaFiltro = fechaInicio ? new Date(fechaInicio).toISOString().split('T')[0] : fecha;
  
  const nombres = {
    inventario: `inventario_completo_${fecha}`,
    movimientos: `movimientos_${fechaFiltro}`,
    'prestamos-activos': `prestamos_activos_${fecha}`,
    categorias: `categorias_${fecha}`,
    observaciones: `observaciones_${fechaFiltro}`,
    tickets: `tickets_${fechaFiltro}`
  };
  
  return `${nombres[tipoReporte]}.${formato === 'excel' ? 'csv' : 'pdf'}`;
}

// Función para guardar en historial
async function saveToHistory(tipoReporte: ReporteType, nombreArchivo: string, formato: 'pdf' | 'excel') {
  try {
    await actionCreateReporteGenerado({
      tipo_reporte: tipoReporte,
      nombre_archivo: nombreArchivo,
      contenido_pdf: formato === 'pdf' ? new Uint8Array([1]) : new Uint8Array(), // Marca que es PDF o Excel
      generado_por: "Usuario"
    });
  } catch (error) {
    console.warn("No se pudo guardar en historial:", error);
  }
}

// Función para descargar archivo
function downloadFile(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  
  // Usar requestAnimationFrame para asegurar que el DOM esté listo
  requestAnimationFrame(() => {
    link.click();
    // Limpiar después de un breve delay
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  });
}

// ===== FUNCIONES ESPECÍFICAS PARA CADA TIPO DE REPORTE =====

export async function generateInventarioReport(tipo: 'pdf' | 'excel', fechaInicio?: string, fechaFin?: string) {
  const datos = await fetchReportData('inventario', fechaInicio, fechaFin) as unknown as InventarioReporteData;
  const nombreArchivo = generateFileName('inventario', tipo);
  
  let dataUrl: string;
  
  if (tipo === 'pdf') {
    dataUrl = await generateInventarioPDF(datos);
    downloadFile(dataUrl, nombreArchivo);
  } else {
    await exportInventarioToExcel(datos);
  }
  await saveToHistory('inventario', nombreArchivo, tipo);
  
  return { success: true, message: `Reporte de inventario generado exitosamente` };
}

export async function generateMovimientosReport(tipo: 'pdf' | 'excel', fechaInicio?: string, fechaFin?: string) {
  const datos = await fetchReportData('movimientos', fechaInicio, fechaFin) as unknown as MovimientosReporteData;
  const nombreArchivo = generateFileName('movimientos', tipo, fechaInicio);
  
  let dataUrl: string;
  
  if (tipo === 'pdf') {
    dataUrl = await generateMovimientosPDF(datos);
    downloadFile(dataUrl, nombreArchivo);
  } else {
    await exportMovimientosToExcel(datos);
  }
  await saveToHistory('movimientos', nombreArchivo, tipo);
  
  return { success: true, message: `Reporte de movimientos generado exitosamente` };
}

export async function generatePrestamosActivosReport(tipo: 'pdf' | 'excel', fechaInicio?: string, fechaFin?: string) {
  const datos = await fetchReportData('prestamos-activos', fechaInicio, fechaFin) as unknown as PrestamosActivosReporteData;
  const nombreArchivo = generateFileName('prestamos-activos', tipo);
  
  let dataUrl: string;
  
  if (tipo === 'pdf') {
    dataUrl = await generatePrestamosPDF(datos);
    downloadFile(dataUrl, nombreArchivo);
  } else {
    await exportPrestamosActivosToExcel(datos);
  }
  await saveToHistory('prestamos-activos', nombreArchivo, tipo);
  
  return { success: true, message: `Reporte de préstamos activos generado exitosamente` };
}

export async function generateCategoriasReport(tipo: 'pdf' | 'excel', fechaInicio?: string, fechaFin?: string) {
  const datos = await fetchReportData('categorias', fechaInicio, fechaFin) as unknown as CategoriasReporteData;
  const nombreArchivo = generateFileName('categorias', tipo);
  
  if (tipo === 'pdf') {
    // Generar PDF con el nuevo estilo profesional
    const pdfDataUrl = await generateCategoriasPDF(datos);
    downloadFile(pdfDataUrl, nombreArchivo);
  } else {
    // Usar la función específica de exportación a Excel
    await exportCategoriasToExcel(datos);
  }
  
  await saveToHistory('categorias', nombreArchivo, tipo);
  return { success: true, message: `Reporte de categorías generado exitosamente` };
}

export async function generateObservacionesReport(tipo: 'pdf' | 'excel', fechaInicio?: string, fechaFin?: string) {
  const datos = await fetchReportData('observaciones', fechaInicio, fechaFin) as unknown as ObservacionesReporteData;
  const nombreArchivo = generateFileName('observaciones', tipo, fechaInicio);
  
  if (tipo === 'pdf') {
    // Generar PDF con el nuevo estilo profesional
    const pdfDataUrl = await generateObservacionesPDF(datos);
    downloadFile(pdfDataUrl, nombreArchivo);
  } else {
    // Usar la función específica de exportación a Excel
    await exportObservacionesToExcel(datos);
  }
  
  await saveToHistory('observaciones', nombreArchivo, tipo);
  return { success: true, message: `Reporte de observaciones generado exitosamente` };
}

export async function generateTicketsReport(tipo: 'pdf' | 'excel', fechaInicio?: string, fechaFin?: string) {
  try {
    const datos = await fetchReportData('tickets', fechaInicio, fechaFin) as unknown as TicketsReporteData;
    const nombreArchivo = generateFileName('tickets', tipo, fechaInicio);
    
    if (tipo === 'pdf') {
      // Generar PDF con el nuevo estilo profesional
      const pdfDataUrl = await generateTicketsPDF(datos);
      downloadFile(pdfDataUrl, nombreArchivo);
    } else {
      // Usar la función específica de exportación a Excel
      await exportTicketsToExcel(datos);
    }
    
    await saveToHistory('tickets', nombreArchivo, tipo);
    return { success: true, message: `Reporte de tickets generado exitosamente` };
  } catch (error) {
    console.error('Error generando reporte de tickets:', error);
    return { success: false, message: `Error al generar reporte de tickets: ${error instanceof Error ? error.message : 'Error desconocido'}` };
  }
}

// Función principal que maneja cualquier tipo de reporte
export async function generateReport(
  tipoReporte: ReporteType,
  formato: 'pdf' | 'excel',
  fechaInicio?: string,
  fechaFin?: string
) {
  try {
    switch (tipoReporte) {
      case 'inventario':
        return await generateInventarioReport(formato, fechaInicio, fechaFin);
      case 'movimientos':
        return await generateMovimientosReport(formato, fechaInicio, fechaFin);
      case 'prestamos-activos':
        return await generatePrestamosActivosReport(formato, fechaInicio, fechaFin);
      case 'categorias':
        return await generateCategoriasReport(formato, fechaInicio, fechaFin);
      case 'observaciones':
        return await generateObservacionesReport(formato, fechaInicio, fechaFin);
      case 'tickets':
        return await generateTicketsReport(formato, fechaInicio, fechaFin);
      default:
        return { success: false, message: "Tipo de reporte no válido" };
    }
  } catch (error) {
    console.error("Error generando reporte:", error);
    return { success: false, message: "Error al generar el reporte" };
  }
}
