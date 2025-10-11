import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';

// Extender jsPDF para incluir autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

/**
 * Función auxiliar para cargar la imagen del logo CDS
 * Solo funciona en el cliente (navegador)
 */
async function loadCDSLogo(): Promise<string> {
  // Verificar si estamos en el navegador
  if (typeof window === 'undefined') {
    throw new Error('loadCDSLogo solo funciona en el cliente');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Redimensionar la imagen con calidad máxima (sin comprimir)
      const maxWidth = 100;
      const maxHeight = 100;
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      if (ctx) {
        // Mejorar la calidad del renderizado
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png', 1.0)); // Máxima calidad PNG
      } else {
        reject(new Error('No se pudo crear el contexto del canvas'));
      }
    };
    img.onerror = () => reject(new Error('Error al cargar la imagen del logo'));
    img.src = '/cds-logo.png';
  });
}

/**
 * Función auxiliar para agregar el logo CDS al PDF
 */
async function addCDSLogoToPDF(doc: jsPDF, x: number = 20, y: number = 18): Promise<void> {
  try {
    const logoDataUrl = await loadCDSLogo();
    doc.addImage(logoDataUrl, 'PNG', x, y, 25, 25);
  } catch (error) {
    console.warn('No se pudo cargar el logo, usando texto como fallback:', error);
    // Fallback a texto si no se puede cargar la imagen
    doc.setFontSize(16);
    doc.setTextColor(66, 139, 202);
    doc.text("CDS", x, y + 20);
  }
}

export type ReporteData = {
  titulo: string;
  fecha: Date;
  datos: Record<string, unknown>[];
  columnas: string[];
  campos: string[];
};

export type InventarioReporteData = {
  elementos: Array<{
    id: number;
    serie: string;
    marca: string | null;
    modelo: string | null;
    cantidad: number;
    ubicacion: string | null;
    estado_funcional: string;
    estado_fisico: string;
    categoria: { nombre: string };
    subcategoria: { nombre: string } | null;
  }>;
};

export type MovimientosReporteData = {
  movimientos: Array<{
    id: number;
    numero_ticket: string;
    fecha_movimiento: Date;
    tipo: string;
    cantidad: number;
    elemento: {
      serie: string;
      marca: string | null;
      modelo: string | null;
    };
    dependencia_entrega: string;
    funcionario_entrega: string;
    dependencia_recibe: string;
    funcionario_recibe: string;
    fecha_estimada_devolucion: Date;
    fecha_real_devolucion: Date | null;
  }>;
};

export type PrestamosActivosReporteData = {
  prestamos: Array<{
    id: number;
    numero_ticket: string;
    fecha_movimiento: Date;
    cantidad: number;
    elemento: {
      serie: string;
      marca: string | null;
      modelo: string | null;
    };
    dependencia_recibe: string;
    funcionario_recibe: string;
    fecha_estimada_devolucion: Date;
  }>;
};

/**
 * Genera un reporte PDF genérico
 */
export async function generateGenericReport(data: ReporteData): Promise<string> {
  const doc = new jsPDF();
  
  // Intentar agregar logo CDS (solo si estamos en el cliente)
  try {
    await addCDSLogoToPDF(doc, 20, 15);
  } catch {
    // Fallback: usar solo texto
    doc.setFontSize(16);
    doc.setTextColor(66, 139, 202);
    doc.text("CDS", 20, 35);
  }
  
  // Título
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(data.titulo, 70, 27);
  
  // Fecha
  doc.setFontSize(12);
  doc.text(`Fecha: ${data.fecha.toLocaleDateString()}`, 70, 42);
  
  // Tabla de datos
  const tableData = data.datos.map(item => 
    data.campos.map(campo => item[campo] || '')
  );
  
  autoTable(doc, {
    head: [data.columnas],
    body: tableData,
    startY: 60,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] },
  });
  
  return doc.output('datauristring');
}

/**
 * Genera reporte de inventario completo
 */
export async function generateInventarioReport(data: InventarioReporteData): Promise<string> {
  const doc = new jsPDF();
  
  // Intentar agregar logo CDS (solo si estamos en el cliente)
  try {
    await addCDSLogoToPDF(doc, 20, 15);
  } catch {
    // Fallback: usar solo texto
    doc.setFontSize(16);
    doc.setTextColor(66, 139, 202);
    doc.text("CDS", 20, 35);
  }
  
  // Título
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text("INVENTARIO COMPLETO", 70, 27);
  
  // Fecha
  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 70, 42);
  doc.text(`Total de elementos: ${data.elementos.length}`, 70, 52);
  
  // Tabla de elementos
  const tableData = data.elementos.map(elemento => [
    elemento.id.toString(),
    elemento.serie,
    elemento.marca || 'N/A',
    elemento.modelo || 'N/A',
    elemento.cantidad.toString(),
    elemento.ubicacion || 'N/A',
    elemento.estado_funcional,
    elemento.estado_fisico,
    elemento.categoria.nombre,
    elemento.subcategoria?.nombre || 'N/A'
  ]);
  
  autoTable(doc, {
    head: [['ID', 'Serie', 'Marca', 'Modelo', 'Cantidad', 'Ubicación', 'Estado Funcional', 'Estado Físico', 'Categoría', 'Subcategoría']],
    body: tableData,
    startY: 70,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [66, 139, 202] },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 15 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20 },
      7: { cellWidth: 20 },
      8: { cellWidth: 25 },
      9: { cellWidth: 25 }
    }
  });
  
  return doc.output('datauristring');
}

/**
 * Genera reporte de movimientos
 */
export async function generateMovimientosReport(data: MovimientosReporteData): Promise<string> {
  const doc = new jsPDF();
  
  // Intentar agregar logo CDS (solo si estamos en el cliente)
  try {
    await addCDSLogoToPDF(doc, 20, 15);
  } catch {
    // Fallback: usar solo texto
    doc.setFontSize(16);
    doc.setTextColor(66, 139, 202);
    doc.text("CDS", 20, 35);
  }
  
  // Título
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text("REPORTE DE MOVIMIENTOS", 70, 27);
  
  // Fecha
  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 70, 42);
  doc.text(`Total de movimientos: ${data.movimientos.length}`, 70, 52);
  
  // Tabla de movimientos
  const tableData = data.movimientos.map(movimiento => [
    movimiento.numero_ticket,
    movimiento.fecha_movimiento.toLocaleDateString(),
    movimiento.tipo,
    `${movimiento.elemento.serie} - ${movimiento.elemento.marca} ${movimiento.elemento.modelo}`,
    movimiento.cantidad.toString(),
    movimiento.dependencia_entrega,
    movimiento.funcionario_entrega,
    movimiento.dependencia_recibe,
    movimiento.funcionario_recibe,
    movimiento.fecha_estimada_devolucion.toLocaleDateString(),
    movimiento.fecha_real_devolucion?.toLocaleDateString() || 'Pendiente'
  ]);
  
  autoTable(doc, {
    head: [['Ticket', 'Fecha', 'Tipo', 'Elemento', 'Cantidad', 'Dependencia Entrega', 'Funcionario Entrega', 'Dependencia Recibe', 'Funcionario Recibe', 'Fecha Est. Devolución', 'Fecha Real Devolución']],
    body: tableData,
    startY: 70,
    styles: { fontSize: 6 },
    headStyles: { fillColor: [66, 139, 202] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 20 },
      2: { cellWidth: 15 },
      3: { cellWidth: 30 },
      4: { cellWidth: 15 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 25 },
      8: { cellWidth: 25 },
      9: { cellWidth: 20 },
      10: { cellWidth: 20 }
    }
  });
  
  return doc.output('datauristring');
}

/**
 * Genera reporte de préstamos activos
 */
export async function generatePrestamosActivosReport(data: PrestamosActivosReporteData): Promise<string> {
  const doc = new jsPDF();
  
  // Intentar agregar logo CDS (solo si estamos en el cliente)
  try {
    await addCDSLogoToPDF(doc, 20, 15);
  } catch {
    // Fallback: usar solo texto
    doc.setFontSize(16);
    doc.setTextColor(66, 139, 202);
    doc.text("CDS", 20, 35);
  }
  
  // Título
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text("PRÉSTAMOS ACTIVOS", 70, 27);
  
  // Fecha
  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 70, 42);
  doc.text(`Total de préstamos activos: ${data.prestamos.length}`, 70, 52);
  
  // Tabla de préstamos activos
  const tableData = data.prestamos.map(prestamo => [
    prestamo.numero_ticket,
    prestamo.fecha_movimiento.toLocaleDateString(),
    `${prestamo.elemento.serie} - ${prestamo.elemento.marca} ${prestamo.elemento.modelo}`,
    prestamo.cantidad.toString(),
    prestamo.dependencia_recibe,
    prestamo.funcionario_recibe,
    prestamo.fecha_estimada_devolucion.toLocaleDateString(),
    prestamo.fecha_estimada_devolucion < new Date() ? 'VENCIDO' : 'VIGENTE'
  ]);
  
  autoTable(doc, {
    head: [['Ticket', 'Fecha', 'Elemento', 'Cantidad', 'Dependencia', 'Funcionario', 'Fecha Est. Devolución', 'Estado']],
    body: tableData,
    startY: 70,
    styles: { fontSize: 7 },
    headStyles: { fillColor: [66, 139, 202] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 20 },
      2: { cellWidth: 35 },
      3: { cellWidth: 15 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 },
      6: { cellWidth: 25 },
      7: { cellWidth: 20 }
    }
  });
  
  return doc.output('datauristring');
}

/**
 * Exporta datos a Excel usando la librería xlsx
 */
export function exportToExcel(data: Record<string, unknown>[], filename: string = 'reporte.xlsx'): void {
  if (data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Crear un nuevo workbook
  const workbook = XLSX.utils.book_new();
  
  // Crear una hoja de trabajo desde los datos
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Agregar la hoja al workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
  
  // Generar el archivo Excel y descargarlo
  XLSX.writeFile(workbook, filename);
}

/**
 * Exporta inventario completo a Excel
 */
export function exportInventarioToExcel(data: InventarioReporteData): string {
  const excelData = data.elementos.map(elemento => ({
    'ID': elemento.id,
    'Serie': elemento.serie,
    'Marca': elemento.marca || 'N/A',
    'Modelo': elemento.modelo || 'N/A',
    'Cantidad': elemento.cantidad,
    'Ubicación': elemento.ubicacion || 'N/A',
    'Estado Funcional': elemento.estado_funcional,
    'Estado Físico': elemento.estado_fisico,
    'Categoría': elemento.categoria.nombre,
    'Subcategoría': elemento.subcategoria?.nombre || 'N/A'
  }));

  exportToExcel(excelData, `inventario_completo_${new Date().toISOString().split('T')[0]}.xlsx`);
  return 'Inventario exportado exitosamente';
}

/**
 * Exporta movimientos a Excel
 */
export function exportMovimientosToExcel(data: MovimientosReporteData): string {
  const excelData = data.movimientos.map(movimiento => ({
    'ID': movimiento.id,
    'Ticket': movimiento.numero_ticket,
    'Fecha': movimiento.fecha_movimiento.toLocaleDateString(),
    'Tipo': movimiento.tipo,
    'Elemento': `${movimiento.elemento.serie} - ${movimiento.elemento.marca} ${movimiento.elemento.modelo}`,
    'Cantidad': movimiento.cantidad,
    'Dependencia Entrega': movimiento.dependencia_entrega,
    'Funcionario Entrega': movimiento.funcionario_entrega,
    'Dependencia Recibe': movimiento.dependencia_recibe,
    'Funcionario Recibe': movimiento.funcionario_recibe,
    'Fecha Est. Devolución': movimiento.fecha_estimada_devolucion.toLocaleDateString(),
    'Fecha Real Devolución': movimiento.fecha_real_devolucion?.toLocaleDateString() || 'Pendiente'
  }));

  exportToExcel(excelData, `movimientos_${new Date().toISOString().split('T')[0]}.xlsx`);
  return 'Movimientos exportados exitosamente';
}

/**
 * Exporta préstamos activos a Excel
 */
export function exportPrestamosActivosToExcel(data: PrestamosActivosReporteData): string {
  const excelData = data.prestamos.map(prestamo => ({
    'ID': prestamo.id,
    'Ticket': prestamo.numero_ticket,
    'Fecha': prestamo.fecha_movimiento.toLocaleDateString(),
    'Elemento': `${prestamo.elemento.serie} - ${prestamo.elemento.marca} ${prestamo.elemento.modelo}`,
    'Cantidad': prestamo.cantidad,
    'Dependencia': prestamo.dependencia_recibe,
    'Funcionario': prestamo.funcionario_recibe,
    'Fecha Est. Devolución': prestamo.fecha_estimada_devolucion.toLocaleDateString(),
    'Estado': prestamo.fecha_estimada_devolucion < new Date() ? 'VENCIDO' : 'VIGENTE'
  }));

  exportToExcel(excelData, `prestamos_activos_${new Date().toISOString().split('T')[0]}.xlsx`);
  return 'Préstamos activos exportados exitosamente';
}
