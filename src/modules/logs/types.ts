export type Log = {
  id: number;
  usuario_id: number;
  accion: string;
  detalles: string | null;
  ip: string | null;
  user_agent: string | null;
  autor_nombre: string | null;
  entity_type: string | null;
  entity_id: number | null;
  creado_en: Date;
};

export type CreateLogInput = { usuario_id: number; accion: string; detalles?: string | null; ip?: string | null };


