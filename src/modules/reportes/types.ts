export type ReporteGenerado = {
  id: number;
  tipo_reporte: string;
  nombre_archivo: string;
  contenido_pdf: Buffer;
  fecha_generacion: Date | null;
  generado_por: string | null;
};

export type CreateReporteInput = {
  tipo_reporte: string;
  nombre_archivo: string;
  contenido_pdf?: Buffer;
  generado_por?: string;
};

export type ReporteFilter = {
  fechaInicio?: Date;
  fechaFin?: Date;
  categoria?: string;
  estado?: string;
};

export type ReporteStats = {
  totalElementos: number;
  totalMovimientos: number;
  totalPrestamosActivos: number;
  totalCategorias: number;
  totalObservaciones: number;
  totalTickets: number;
};

