import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("CDS", x, y + 20);
  }
}

/**
 * Función auxiliar para crear la cabecera profesional de los reportes
 */
async function addProfessionalHeader(doc: jsPDF, title: string): Promise<number> {
  // Configurar el marco unificado
  doc.setDrawColor(0, 0, 0); // Negro
  doc.setLineWidth(0.3);
  
  // Intentar agregar logo CDS (ajustado para orientación horizontal)
  try {
    await addCDSLogoToPDF(doc, 20, 18);
  } catch {
    // Fallback a texto si no se puede cargar la imagen
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("CDS", 25, 28);
  }

  // Título principal (ajustado para orientación horizontal)
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("SISTEMA DE INVENTARIO CDS", 70, 25);
  
  // Subtítulo del reporte
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(title, 70, 32);
  
  // Fecha de generación
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 70, 39);

  // Línea separadora (ajustada para orientación horizontal)
  doc.setLineWidth(0.15);
  doc.line(20, 48, 270, 48);

  return 55; // Retorna la posición Y donde continuar
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

export type CategoriasReporteData = {
  categorias: Array<{
    id: number;
    nombre: string;
    descripcion: string | null;
    estado: string;
    total_elementos: number;
    total_subcategorias: number;
    creado_en: Date;
  }>;
};

export type ObservacionesReporteData = {
  observaciones: Array<{
    id: number;
    fecha_observacion: Date;
    descripcion: string;
    elemento_serie: string;
    elemento_marca: string | null;
    elemento_modelo: string | null;
    elemento_categoria: string;
    creado_en: Date;
  }>;
};

export type TicketsReporteData = {
  tickets: Array<{
    id: number;
    numero_ticket: string;
    fecha_salida: Date;
    fecha_estimada_devolucion: Date | null;
    elemento: string | null;
    serie: string | null;
    marca_modelo: string | null;
    cantidad: number;
    dependencia_entrega: string | null;
    dependencia_recibe: string | null;
    motivo: string | null;
    orden_numero: string | null;
    fecha_guardado: Date | null;
    usuario_guardado: string | null;
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
  const doc = new jsPDF('landscape'); // Orientación horizontal
  
  // Calcular la altura total del documento para el marco (ajustada para landscape)
  let totalHeight = 40; // Header
  totalHeight += 15; // Espacio
  totalHeight += 35; // Información del reporte
  totalHeight += 15; // Espacio
  totalHeight += Math.max(20, data.elementos.length * 4); // Tabla (mínimo 20, más si hay muchos elementos)
  totalHeight += 25; // Footer
  totalHeight += 20; // Espacio final
  
  // Dibujar el marco unificado (ajustado para orientación horizontal)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(15, 10, 260, totalHeight, "S");
  
  // Agregar cabecera profesional
  let y = await addProfessionalHeader(doc, "REPORTE DE INVENTARIO COMPLETO");
  
  // Información del reporte
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("INFORMACIÓN DEL REPORTE", 20, y);
  
  // Línea separadora debajo del título (ajustada para landscape)
  doc.setLineWidth(0.15);
  doc.line(20, y + 2, 270, y + 2);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de elementos: ${data.elementos.length}`, 20, y);
  y += 6;
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, y);
  y += 15;
  
  // Tabla de elementos (con columnas ajustadas para que quepan en el recuadro)
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
    head: [['ID', 'Serie', 'Marca', 'Modelo', 'Cant.', 'Ubic.', 'Estado\nFuncional', 'Estado\nFísico', 'Categoría', 'Subcat.']],
    body: tableData,
    startY: y,
    margin: { left: 20, right: 20 },
    styles: { 
      fontSize: 6,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      cellPadding: 2
    },
    headStyles: { 
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 25 },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 15 },
      5: { cellWidth: 22 },
      6: { cellWidth: 22 },
      7: { cellWidth: 22 },
      8: { cellWidth: 25 },
      9: { cellWidth: 25 }
    }
  });
  
  // Footer (ajustado para landscape)
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y + 50;
  doc.setLineWidth(0.15);
  doc.line(20, finalY + 10, 270, finalY + 10);
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado por: Sistema de Inventario CDS`, 25, finalY + 20);
  doc.text(`Reporte de Inventario Completo`, 255, finalY + 20, { align: "right" });
  
  return doc.output('datauristring');
}

/**
 * Genera reporte de movimientos
 */
export async function generateMovimientosReport(data: MovimientosReporteData): Promise<string> {
  const doc = new jsPDF('landscape'); // Orientación horizontal
  
  // Calcular la altura total del documento para el marco (ajustada para landscape)
  let totalHeight = 40; // Header
  totalHeight += 15; // Espacio
  totalHeight += 35; // Información del reporte
  totalHeight += 15; // Espacio
  totalHeight += Math.max(20, data.movimientos.length * 4); // Tabla (mínimo 20, más si hay muchos movimientos)
  totalHeight += 25; // Footer
  totalHeight += 20; // Espacio final
  
  // Dibujar el marco unificado (ajustado para orientación horizontal)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(15, 10, 260, totalHeight, "S");
  
  // Agregar cabecera profesional
  let y = await addProfessionalHeader(doc, "REPORTE DE MOVIMIENTOS");
  
  // Información del reporte
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("INFORMACIÓN DEL REPORTE", 20, y);
  
  // Línea separadora debajo del título (ajustada para landscape)
  doc.setLineWidth(0.15);
  doc.line(20, y + 2, 270, y + 2);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de movimientos: ${data.movimientos.length}`, 20, y);
  y += 6;
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, y);
  y += 15;
  
  // Tabla de movimientos (con columnas ajustadas para que quepan en el recuadro)
  const tableData = data.movimientos.map(movimiento => [
    movimiento.numero_ticket,
    movimiento.fecha_movimiento.toLocaleDateString('es-ES'),
    movimiento.tipo,
    `${movimiento.elemento.serie} - ${movimiento.elemento.marca} ${movimiento.elemento.modelo}`,
    movimiento.cantidad.toString(),
    movimiento.dependencia_entrega,
    movimiento.funcionario_entrega,
    movimiento.dependencia_recibe,
    movimiento.funcionario_recibe,
    movimiento.fecha_estimada_devolucion.toLocaleDateString('es-ES'),
    movimiento.fecha_real_devolucion?.toLocaleDateString('es-ES') || 'Pendiente'
  ]);
  
  autoTable(doc, {
    head: [['Ticket', 'Fecha', 'Tipo', 'Elemento', 'Cant.', 'Dep.\nEntrega', 'Func.\nEntrega', 'Dep.\nRecibe', 'Func.\nRecibe', 'Fecha Est.\nDevol.', 'Fecha Real\nDevol.']],
    body: tableData,
    startY: y,
    margin: { left: 20, right: 20 },
    styles: { 
      fontSize: 6,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      cellPadding: 2
    },
    headStyles: { 
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 18 },
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
  
  // Footer (ajustado para landscape)
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y + 50;
  doc.setLineWidth(0.15);
  doc.line(20, finalY + 10, 270, finalY + 10);
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado por: Sistema de Inventario CDS`, 25, finalY + 20);
  doc.text(`Reporte de Movimientos`, 255, finalY + 20, { align: "right" });
  
  return doc.output('datauristring');
}

/**
 * Genera reporte de préstamos activos
 */
export async function generatePrestamosActivosReport(data: PrestamosActivosReporteData): Promise<string> {
  const doc = new jsPDF('landscape'); // Orientación horizontal
  
  // Calcular la altura total del documento para el marco (ajustada para landscape)
  let totalHeight = 40; // Header
  totalHeight += 15; // Espacio
  totalHeight += 35; // Información del reporte
  totalHeight += 15; // Espacio
  totalHeight += Math.max(20, data.prestamos.length * 4); // Tabla (mínimo 20, más si hay muchos préstamos)
  totalHeight += 25; // Footer
  totalHeight += 20; // Espacio final
  
  // Dibujar el marco unificado (ajustado para orientación horizontal)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(15, 10, 260, totalHeight, "S");
  
  // Agregar cabecera profesional
  let y = await addProfessionalHeader(doc, "REPORTE DE PRÉSTAMOS ACTIVOS");
  
  // Información del reporte
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("INFORMACIÓN DEL REPORTE", 20, y);
  
  // Línea separadora debajo del título (ajustada para landscape)
  doc.setLineWidth(0.15);
  doc.line(20, y + 2, 270, y + 2);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de préstamos activos: ${data.prestamos.length}`, 20, y);
  y += 6;
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, y);
  y += 15;
  
  // Tabla de préstamos activos (con columnas ajustadas para que quepan en el recuadro)
  const tableData = data.prestamos.map(prestamo => [
    prestamo.numero_ticket,
    prestamo.fecha_movimiento.toLocaleDateString('es-ES'),
    `${prestamo.elemento.serie} - ${prestamo.elemento.marca} ${prestamo.elemento.modelo}`,
    prestamo.cantidad.toString(),
    prestamo.dependencia_recibe,
    prestamo.funcionario_recibe,
    prestamo.fecha_estimada_devolucion.toLocaleDateString('es-ES'),
    prestamo.fecha_estimada_devolucion < new Date() ? 'VENCIDO' : 'VIGENTE'
  ]);
  
  autoTable(doc, {
    head: [['Ticket', 'Fecha', 'Elemento', 'Cant.', 'Dependencia', 'Funcionario', 'Fecha Est.\nDevolución', 'Estado']],
    body: tableData,
    startY: y,
    margin: { left: 20, right: 20 },
    styles: { 
      fontSize: 7,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      cellPadding: 2
    },
    headStyles: { 
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 },
      2: { cellWidth: 35 },
      3: { cellWidth: 18 },
      4: { cellWidth: 35 },
      5: { cellWidth: 35 },
      6: { cellWidth: 25 },
      7: { cellWidth: 20 }
    }
  });
  
  // Footer (ajustado para landscape)
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y + 50;
  doc.setLineWidth(0.15);
  doc.line(20, finalY + 10, 270, finalY + 10);
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado por: Sistema de Inventario CDS`, 25, finalY + 20);
  doc.text(`Reporte de Préstamos Activos`, 255, finalY + 20, { align: "right" });
  
  return doc.output('datauristring');
}

/**
 * Genera reporte de categorías
 */
export async function generateCategoriasReport(data: CategoriasReporteData): Promise<string> {
  const doc = new jsPDF('landscape'); // Orientación horizontal
  
  // Calcular la altura total del documento para el marco (ajustada para landscape)
  let totalHeight = 40; // Header
  totalHeight += 15; // Espacio
  totalHeight += 35; // Información del reporte
  totalHeight += 15; // Espacio
  totalHeight += Math.max(20, data.categorias.length * 4); // Tabla (mínimo 20, más si hay muchas categorías)
  totalHeight += 25; // Footer
  totalHeight += 20; // Espacio final
  
  // Dibujar el marco unificado (ajustado para orientación horizontal)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(15, 10, 260, totalHeight, "S");
  
  // Agregar cabecera profesional
  let y = await addProfessionalHeader(doc, "REPORTE DE CATEGORÍAS");
  
  // Información del reporte
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("INFORMACIÓN DEL REPORTE", 20, y);
  
  // Línea separadora debajo del título (ajustada para landscape)
  doc.setLineWidth(0.15);
  doc.line(20, y + 2, 270, y + 2);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de categorías: ${data.categorias.length}`, 20, y);
  y += 6;
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, y);
  y += 15;
  
  // Tabla de categorías (con columnas ajustadas para que quepan en el recuadro)
  const tableData = data.categorias.map(categoria => [
    categoria.id.toString(),
    categoria.nombre,
    categoria.descripcion || 'Sin descripción',
    categoria.estado,
    categoria.total_elementos.toString(),
    categoria.total_subcategorias.toString(),
    categoria.creado_en.toLocaleDateString('es-ES')
  ]);
  
  autoTable(doc, {
    head: [['ID', 'Nombre', 'Descripción', 'Estado', 'Total\nElementos', 'Total\nSubcategorías', 'Fecha\nCreación']],
    body: tableData,
    startY: y,
    margin: { left: 20, right: 20 },
    styles: { 
      fontSize: 7,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      cellPadding: 2
    },
    headStyles: { 
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 35 },
      2: { cellWidth: 45 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
      6: { cellWidth: 22 }
    }
  });
  
  // Footer (ajustado para landscape)
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y + 50;
  doc.setLineWidth(0.15);
  doc.line(20, finalY + 10, 270, finalY + 10);
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado por: Sistema de Inventario CDS`, 25, finalY + 20);
  doc.text(`Reporte de Categorías`, 255, finalY + 20, { align: "right" });
  
  return doc.output('datauristring');
}

/**
 * Genera reporte de observaciones
 */
export async function generateObservacionesReport(data: ObservacionesReporteData): Promise<string> {
  const doc = new jsPDF('landscape'); // Orientación horizontal
  
  // Calcular la altura total del documento para el marco (ajustada para landscape)
  let totalHeight = 40; // Header
  totalHeight += 15; // Espacio
  totalHeight += 35; // Información del reporte
  totalHeight += 15; // Espacio
  totalHeight += Math.max(20, data.observaciones.length * 4); // Tabla (mínimo 20, más si hay muchas observaciones)
  totalHeight += 25; // Footer
  totalHeight += 20; // Espacio final
  
  // Dibujar el marco unificado (ajustado para orientación horizontal)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(15, 10, 260, totalHeight, "S");
  
  // Agregar cabecera profesional
  let y = await addProfessionalHeader(doc, "REPORTE DE OBSERVACIONES");
  
  // Información del reporte
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("INFORMACIÓN DEL REPORTE", 20, y);
  
  // Línea separadora debajo del título (ajustada para landscape)
  doc.setLineWidth(0.15);
  doc.line(20, y + 2, 270, y + 2);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de observaciones: ${data.observaciones.length}`, 20, y);
  y += 6;
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, y);
  y += 15;
  
  // Tabla de observaciones (con columnas ajustadas para que quepan en el recuadro)
  const tableData = data.observaciones.map(observacion => [
    observacion.id.toString(),
    observacion.fecha_observacion.toLocaleDateString('es-ES'),
    observacion.elemento_serie,
    `${observacion.elemento_marca || 'N/A'} ${observacion.elemento_modelo || 'N/A'}`,
    observacion.elemento_categoria,
    observacion.descripcion.length > 60 ? observacion.descripcion.substring(0, 60) + '...' : observacion.descripcion,
    observacion.creado_en.toLocaleDateString('es-ES')
  ]);
  
  autoTable(doc, {
    head: [['ID', 'Fecha\nObs.', 'Serie', 'Marca/\nModelo', 'Categoría', 'Descripción', 'Fecha\nCreación']],
    body: tableData,
    startY: y,
    margin: { left: 20, right: 20 },
    styles: { 
      fontSize: 6,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      cellPadding: 2
    },
    headStyles: { 
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 18 },
      2: { cellWidth: 22 },
      3: { cellWidth: 30 },
      4: { cellWidth: 22 },
      5: { cellWidth: 45 },
      6: { cellWidth: 18 }
    }
  });
  
  // Footer (ajustado para landscape)
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y + 50;
  doc.setLineWidth(0.15);
  doc.line(20, finalY + 10, 270, finalY + 10);
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado por: Sistema de Inventario CDS`, 25, finalY + 20);
  doc.text(`Reporte de Observaciones`, 255, finalY + 20, { align: "right" });
  
  return doc.output('datauristring');
}

/**
 * Genera reporte de tickets
 */
export async function generateTicketsReport(data: TicketsReporteData): Promise<string> {
  const doc = new jsPDF('landscape'); // Orientación horizontal
  
  // Calcular la altura total del documento para el marco (ajustada para landscape)
  let totalHeight = 40; // Header
  totalHeight += 15; // Espacio
  totalHeight += 35; // Información del reporte
  totalHeight += 15; // Espacio
  totalHeight += Math.max(20, data.tickets.length * 4); // Tabla (mínimo 20, más si hay muchos tickets)
  totalHeight += 25; // Footer
  totalHeight += 20; // Espacio final
  
  // Dibujar el marco unificado (ajustado para orientación horizontal)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(15, 10, 260, totalHeight, "S");
  
  // Agregar cabecera profesional
  let y = await addProfessionalHeader(doc, "REPORTE DE TICKETS GUARDADOS");
  
  // Información del reporte
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("INFORMACIÓN DEL REPORTE", 20, y);
  
  // Línea separadora debajo del título (ajustada para landscape)
  doc.setLineWidth(0.15);
  doc.line(20, y + 2, 270, y + 2);
  y += 8;
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de tickets: ${data.tickets.length}`, 20, y);
  y += 6;
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, y);
  y += 15;
  
  // Tabla de tickets (con columnas ajustadas para que quepan en el recuadro)
  const tableData = data.tickets.map(ticket => [
    ticket.numero_ticket,
    ticket.fecha_salida.toLocaleDateString('es-ES'),
    ticket.fecha_estimada_devolucion?.toLocaleDateString('es-ES') || 'No especificado',
    ticket.elemento || 'N/A',
    ticket.serie || 'N/A',
    ticket.cantidad.toString(),
    ticket.dependencia_entrega || 'N/A',
    ticket.dependencia_recibe || 'N/A',
    ticket.usuario_guardado || 'N/A'
  ]);
  
  autoTable(doc, {
    head: [['Ticket', 'Fecha\nSalida', 'Fecha Est.\nDevolución', 'Elemento', 'Serie', 'Cant.', 'Dep.\nEntrega', 'Dep.\nRecibe', 'Usuario']],
    body: tableData,
    startY: y,
    margin: { left: 20, right: 20 },
    styles: { 
      fontSize: 6,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      cellPadding: 2
    },
    headStyles: { 
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 18 },
      2: { cellWidth: 18 },
      3: { cellWidth: 28 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 },
      6: { cellWidth: 28 },
      7: { cellWidth: 28 },
      8: { cellWidth: 20 }
    }
  });
  
  // Footer (ajustado para landscape)
  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || y + 50;
  doc.setLineWidth(0.15);
  doc.line(20, finalY + 10, 270, finalY + 10);
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado por: Sistema de Inventario CDS`, 25, finalY + 20);
  doc.text(`Reporte de Tickets Guardados`, 255, finalY + 20, { align: "right" });
  
  return doc.output('datauristring');
}

/**
 * Función auxiliar para cargar y convertir imagen a base64
 * @deprecated No se usa actualmente
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function loadImageAsBase64(imagePath: string): Promise<string> {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remover el prefijo "data:image/png;base64,"
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    console.warn('No se pudo cargar el logo, usando texto alternativo');
    return '';
  }
}

/**
 * Exporta datos a Excel con diseño profesional usando CSV mejorado
 */
export async function exportToExcel(data: Record<string, unknown>[], filename: string = 'reporte.xlsx', reportTitle: string = 'REPORTE'): Promise<void> {
  if (data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  try {
    const headers = Object.keys(data[0]);
    const tableData = data.map(row => headers.map(header => {
      const value = row[header];
      // Escapar comillas y caracteres especiales para CSV
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || 'N/A';
    }));

    // Crear contenido CSV con encabezado profesional
    let csvContent = '';
    
    // Agregar información del reporte
    csvContent += `SISTEMA DE INVENTARIO CDS\n`;
    csvContent += `${reportTitle}\n`;
    csvContent += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
    csvContent += `Total de registros: ${data.length}\n\n`;
    
    // Agregar encabezados
    csvContent += headers.map(header => `"${header}"`).join(',') + '\n';
    
    // Agregar datos
    tableData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    // Crear blob con el tipo correcto para Excel
    const blob = new Blob([csvContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8' 
    });
    
    // Crear URL y descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace('.xlsx', '.csv'); // Cambiar extensión a CSV
    link.style.display = 'none';
    
    // Agregar al DOM y hacer clic
    document.body.appendChild(link);
    
    // Usar setTimeout para asegurar que el DOM esté listo
    setTimeout(() => {
      link.click();
      
      // Limpiar después de un breve delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 100);
    }, 10);
    
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    throw new Error('Error al generar el archivo Excel');
  }
}

/**
 * Exporta inventario completo a Excel
 */
export async function exportInventarioToExcel(data: InventarioReporteData): Promise<string> {
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

  await exportToExcel(excelData, `inventario_completo_${new Date().toISOString().split('T')[0]}.csv`, 'REPORTE DE INVENTARIO COMPLETO');
  return 'Inventario exportado exitosamente';
}

/**
 * Exporta movimientos a Excel
 */
export async function exportMovimientosToExcel(data: MovimientosReporteData): Promise<string> {
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

  await exportToExcel(excelData, `movimientos_${new Date().toISOString().split('T')[0]}.csv`, 'REPORTE DE MOVIMIENTOS');
  return 'Movimientos exportados exitosamente';
}

/**
 * Exporta préstamos activos a Excel
 */
export async function exportPrestamosActivosToExcel(data: PrestamosActivosReporteData): Promise<string> {
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

  await exportToExcel(excelData, `prestamos_activos_${new Date().toISOString().split('T')[0]}.csv`, 'REPORTE DE PRÉSTAMOS ACTIVOS');
  return 'Préstamos activos exportados exitosamente';
}

/**
 * Exporta categorías a Excel
 */
export async function exportCategoriasToExcel(data: CategoriasReporteData): Promise<string> {
  const excelData = data.categorias.map(categoria => ({
    'ID': categoria.id,
    'Nombre': categoria.nombre,
    'Descripción': categoria.descripcion || 'Sin descripción',
    'Estado': categoria.estado,
    'Total Elementos': categoria.total_elementos,
    'Total Subcategorías': categoria.total_subcategorias,
    'Fecha Creación': categoria.creado_en.toLocaleDateString('es-ES')
  }));

  await exportToExcel(excelData, `categorias_${new Date().toISOString().split('T')[0]}.csv`, 'REPORTE DE CATEGORÍAS');
  return 'Categorías exportadas exitosamente';
}

/**
 * Exporta observaciones a Excel
 */
export async function exportObservacionesToExcel(data: ObservacionesReporteData): Promise<string> {
  const excelData = data.observaciones.map(observacion => ({
    'ID': observacion.id,
    'Fecha Observación': observacion.fecha_observacion.toLocaleDateString('es-ES'),
    'Serie': observacion.elemento_serie,
    'Marca/Modelo': `${observacion.elemento_marca || 'N/A'} ${observacion.elemento_modelo || 'N/A'}`,
    'Categoría': observacion.elemento_categoria,
    'Descripción': observacion.descripcion,
    'Fecha Creación': observacion.creado_en.toLocaleDateString('es-ES')
  }));

  await exportToExcel(excelData, `observaciones_${new Date().toISOString().split('T')[0]}.csv`, 'REPORTE DE OBSERVACIONES');
  return 'Observaciones exportadas exitosamente';
}

/**
 * Exporta tickets a Excel
 */
export async function exportTicketsToExcel(data: TicketsReporteData): Promise<string> {
  const excelData = data.tickets.map(ticket => ({
    'ID': ticket.id,
    'Ticket': ticket.numero_ticket,
    'Fecha Salida': ticket.fecha_salida.toLocaleDateString('es-ES'),
    'Fecha Est. Devolución': ticket.fecha_estimada_devolucion?.toLocaleDateString('es-ES') || 'No especificado',
    'Elemento': ticket.elemento || 'N/A',
    'Serie': ticket.serie || 'N/A',
    'Cantidad': ticket.cantidad,
    'Dependencia Entrega': ticket.dependencia_entrega || 'N/A',
    'Dependencia Recibe': ticket.dependencia_recibe || 'N/A',
    'Motivo': ticket.motivo || 'N/A',
    'Orden Número': ticket.orden_numero || 'N/A',
    'Usuario Guardado': ticket.usuario_guardado || 'N/A'
  }));

  await exportToExcel(excelData, `tickets_${new Date().toISOString().split('T')[0]}.csv`, 'REPORTE DE TICKETS GUARDADOS');
  return 'Tickets exportados exitosamente';
}
