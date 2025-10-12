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
  exportToExcel
} from "./report-generator";
import { actionCreateReporteGenerado } from "../modules/reportes_generados/actions";

// Tipos de reporte disponibles
export type ReporteType = 
  | "inventario"
  | "movimientos" 
  | "prestamos-activos"
  | "categorias"
  | "observaciones"
  | "tickets";

// Función para obtener datos desde las API routes
async function fetchReportData(
  tipoReporte: ReporteType, 
  fechaInicio?: string, 
  fechaFin?: string
) {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);
  
  const url = `/api/reportes/${tipoReporte}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error al obtener datos de ${tipoReporte}`);
  }
  
  return response.json();
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
  
  return `${nombres[tipoReporte]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;
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
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ===== FUNCIONES ESPECÍFICAS PARA CADA TIPO DE REPORTE =====

export async function generateInventarioReport(tipo: 'pdf' | 'excel', fechaInicio?: string, fechaFin?: string) {
  const datos = await fetchReportData('inventario', fechaInicio, fechaFin);
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
  const datos = await fetchReportData('movimientos', fechaInicio, fechaFin);
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
  const datos = await fetchReportData('prestamos-activos', fechaInicio, fechaFin);
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
  const datos = await fetchReportData('categorias', fechaInicio, fechaFin);
  const nombreArchivo = generateFileName('categorias', tipo);
  
  if (tipo === 'pdf') {
    // Generar PDF con el nuevo estilo profesional
    const pdfDataUrl = await generateCategoriasPDF({ categorias: datos });
    
    // Crear enlace de descarga
    const link = document.createElement('a');
    link.href = pdfDataUrl;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    await saveToHistory('categorias', nombreArchivo, tipo);
    return { success: true, message: `Reporte de categorías generado exitosamente` };
  }
  
  const excelData = datos.map((cat: { id: number; nombre: string; descripcion: string | null; estado: string; total_elementos: number; total_subcategorias: number; creado_en: Date }) => ({
    'ID': cat.id,
    'Nombre': cat.nombre,
    'Descripción': cat.descripcion,
    'Estado': cat.estado,
    'Total Elementos': cat.total_elementos,
    'Total Subcategorías': cat.total_subcategorias,
    'Creado': new Date(cat.creado_en).toLocaleDateString()
  }));
  
  await exportToExcel(excelData, nombreArchivo, 'REPORTE DE CATEGORÍAS');
  await saveToHistory('categorias', nombreArchivo, tipo);
  
  return { success: true, message: `Reporte de categorías generado exitosamente` };
}

export async function generateObservacionesReport(tipo: 'pdf' | 'excel', fechaInicio?: string, fechaFin?: string) {
  const datos = await fetchReportData('observaciones', fechaInicio, fechaFin);
  const nombreArchivo = generateFileName('observaciones', tipo, fechaInicio);
  
  if (tipo === 'pdf') {
    // Generar PDF con el nuevo estilo profesional
    const pdfDataUrl = await generateObservacionesPDF({ observaciones: datos });
    
    // Crear enlace de descarga
    const link = document.createElement('a');
    link.href = pdfDataUrl;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    await saveToHistory('observaciones', nombreArchivo, tipo);
    return { success: true, message: `Reporte de observaciones generado exitosamente` };
  }
  
  const excelData = datos.map((obs: { id: number; fecha_observacion: Date; descripcion: string; elemento_serie: string; elemento_marca: string | null; elemento_modelo: string | null; elemento_categoria: string; creado_en: Date }) => ({
    'ID': obs.id,
    'Fecha Observación': new Date(obs.fecha_observacion).toLocaleDateString(),
    'Descripción': obs.descripcion,
    'Elemento Serie': obs.elemento_serie,
    'Elemento Marca': obs.elemento_marca,
    'Elemento Modelo': obs.elemento_modelo,
    'Categoría': obs.elemento_categoria,
    'Creado': new Date(obs.creado_en).toLocaleDateString()
  }));
  
  await exportToExcel(excelData, nombreArchivo, 'REPORTE DE OBSERVACIONES');
  await saveToHistory('observaciones', nombreArchivo, tipo);
  
  return { success: true, message: `Reporte de observaciones generado exitosamente` };
}

export async function generateTicketsReport(tipo: 'pdf' | 'excel', fechaInicio?: string, fechaFin?: string) {
  const datos = await fetchReportData('tickets', fechaInicio, fechaFin);
  const nombreArchivo = generateFileName('tickets', tipo, fechaInicio);
  
  if (tipo === 'pdf') {
    // Generar PDF con el nuevo estilo profesional
    const pdfDataUrl = await generateTicketsPDF({ tickets: datos });
    
    // Crear enlace de descarga
    const link = document.createElement('a');
    link.href = pdfDataUrl;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    await saveToHistory('tickets', nombreArchivo, tipo);
    return { success: true, message: `Reporte de tickets generado exitosamente` };
  }
  
  const excelData = datos.map((ticket: { id: number; numero_ticket: string; fecha_salida: Date; fecha_estimada_devolucion: Date | null; elemento: string | null; serie: string | null; marca_modelo: string | null; cantidad: number; dependencia_entrega: string | null; dependencia_recibe: string | null; motivo: string | null; orden_numero: string | null; usuario_guardado: string | null }) => ({
    'ID': ticket.id,
    'Número Ticket': ticket.numero_ticket,
    'Fecha Salida': new Date(ticket.fecha_salida).toLocaleDateString(),
    'Fecha Est. Devolución': ticket.fecha_estimada_devolucion ? new Date(ticket.fecha_estimada_devolucion).toLocaleDateString() : 'N/A',
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
  
  await exportToExcel(excelData, nombreArchivo, 'REPORTE DE TICKETS GUARDADOS');
  await saveToHistory('tickets', nombreArchivo, tipo);
  
  return { success: true, message: `Reporte de tickets generado exitosamente` };
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
