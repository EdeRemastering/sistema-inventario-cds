export type BajaElemento = {
  id: number;
  elemento_id: number;
  fecha_baja: Date;
  motivo: string;
  evidencia_pdf_url: string;
  autorizado_por_id: number;
  creado_por_id: number;
  creado_en: Date;
  elemento?: {
    id: number;
    serie: string;
    marca: string | null;
    modelo: string | null;
    codigo_equipo: string | null;
  };
  autorizador?: { id: number; nombre: string; apellido: string | null };
  solicitante?: { id: number; nombre: string; apellido: string | null };
};

export type CreateBajaElementoInput = {
  elemento_id: number;
  fecha_baja: Date;
  motivo: string;
  evidencia_pdf_url: string;
  autorizado_por_id: number;
  creado_por_id: number;
};
