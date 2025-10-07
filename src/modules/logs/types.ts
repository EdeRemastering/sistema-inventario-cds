export type Log = {
  id: number;
  usuario_id: number;
  accion: string;
  detalles: string | null;
  ip: string | null;
  creado_en: Date;
};

export type CreateLogInput = { usuario_id: number; accion: string; detalles?: string | null; ip?: string | null };


