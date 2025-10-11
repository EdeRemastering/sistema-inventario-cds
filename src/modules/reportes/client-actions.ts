"use client";

import { 
  exportInventarioToExcel,
  exportMovimientosToExcel,
  exportPrestamosActivosToExcel,
  exportToExcel
} from "../../lib/report-generator";
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

async function fetchCategoriasData() {
  const response = await fetch('/api/reportes/categorias');
  if (!response.ok) throw new Error('Error al obtener datos de categorías');
  return response.json();
}

async function fetchObservacionesData(fechaInicio?: string, fechaFin?: string) {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);
  
  const response = await fetch(`/api/reportes/observaciones?${params.toString()}`);
  if (!response.ok) throw new Error('Error al obtener datos de observaciones');
  return response.json();
}

async function fetchTicketsData(fechaInicio?: string, fechaFin?: string) {
  const params = new URLSearchParams();
  if (fechaInicio) params.append('fechaInicio', fechaInicio);
  if (fechaFin) params.append('fechaFin', fechaFin);
  
  const response = await fetch(`/api/reportes/tickets?${params.toString()}`);
  if (!response.ok) throw new Error('Error al obtener datos de tickets');
  return response.json();
}

export async function actionExportToExcel(
  tipoReporte: string,
  fechaInicio?: string,
  fechaFin?: string
) {
  try {
    let result: string;

    // Convertir fechas si se proporcionan
    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : undefined;
    const fechaFinDate = fechaFin ? new Date(fechaFin) : undefined;

    switch (tipoReporte) {
      case "inventario":
        const inventarioData = await fetchInventarioData();
        result = exportInventarioToExcel(inventarioData);
        break;

      case "movimientos":
        const movimientosData = await fetchMovimientosData(fechaInicio, fechaFin);
        result = exportMovimientosToExcel(movimientosData);
        break;

      case "prestamos-activos":
        const prestamosData = await fetchPrestamosActivosData();
        result = exportPrestamosActivosToExcel(prestamosData);
        break;

      case "categorias":
        const categoriasData = await fetchCategoriasData();
        const excelData = categoriasData.map((cat: any) => ({
          'ID': cat.id,
          'Nombre': cat.nombre,
          'Descripción': cat.descripcion,
          'Estado': cat.estado,
          'Total Elementos': cat.total_elementos,
          'Total Subcategorías': cat.total_subcategorias,
          'Creado': new Date(cat.creado_en).toLocaleDateString()
        }));
        exportToExcel(excelData, `categorias_${new Date().toISOString().split('T')[0]}.xlsx`);
        result = "Reporte de categorías exportado exitosamente";
        break;

      case "observaciones":
        const observacionesData = await fetchObservacionesData(fechaInicio, fechaFin);
        const observacionesExcelData = observacionesData.map((obs: any) => ({
          'ID': obs.id,
          'Fecha Observación': new Date(obs.fecha_observacion).toLocaleDateString(),
          'Descripción': obs.descripcion,
          'Elemento Serie': obs.elemento_serie,
          'Elemento Marca': obs.elemento_marca,
          'Elemento Modelo': obs.elemento_modelo,
          'Categoría': obs.elemento_categoria,
          'Creado': new Date(obs.creado_en).toLocaleDateString()
        }));
        exportToExcel(observacionesExcelData, `observaciones_${fechaInicio ? new Date(fechaInicio).toISOString().split('T')[0] : 'todos'}.xlsx`);
        result = "Reporte de observaciones exportado exitosamente";
        break;

      case "tickets":
        const ticketsData = await fetchTicketsData(fechaInicio, fechaFin);
        const ticketsExcelData = ticketsData.map((ticket: any) => ({
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
        exportToExcel(ticketsExcelData, `tickets_${fechaInicio ? new Date(fechaInicio).toISOString().split('T')[0] : 'todos'}.xlsx`);
        result = "Reporte de tickets exportado exitosamente";
        break;

      default:
        throw new Error("Tipo de reporte no válido");
    }

    return { success: true, message: result };

  } catch (error) {
    console.error("Error exportando a Excel:", error);
    return { success: false, message: "Error al exportar el reporte" };
  }
}
