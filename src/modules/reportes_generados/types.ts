export type ReporteGenerado = {
  id: number;
  tipo_reporte: string;
  nombre_archivo: string;
  contenido_pdf: Uint8Array;
  fecha_generacion: Date | null;
  generado_por: string | null;
};

export type CreateReporteInput = Pick<ReporteGenerado, "tipo_reporte" | "nombre_archivo"> & { contenido_pdf?: Uint8Array; generado_por?: string | null };


