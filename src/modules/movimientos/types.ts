export type Movimiento = {
  id: number;
  elemento_id: number;
  cantidad: number;
  orden_numero: string;
  fecha_movimiento: Date;
  dependencia_entrega: string;
  firma_funcionario_entrega: string | null;
  cargo_funcionario_entrega: string | null;
  dependencia_recibe: string;
  firma_funcionario_recibe: string | null;
  cargo_funcionario_recibe: string | null;
  motivo: string;
  fecha_estimada_devolucion: Date;
  fecha_real_devolucion: Date | null;
  observaciones_entrega: string | null;
  observaciones_devolucion: string | null;
  firma_recepcion: string | null;
  tipo: "SALIDA" | "DEVOLUCION";
  firma_entrega: string | null;
  firma_recibe: string | null;
  codigo_equipo: string | null;
  serial_equipo: string | null;
  hora_entrega: Date | null;
  hora_devolucion: Date | null;
  numero_ticket: string;
  creado_en: Date;
  firma_devuelve: string | null;
  firma_recibe_devolucion: string | null;
  devuelto_por: string | null;
  recibido_por: string | null;
};

export type CreateMovimientoInput = Omit<Movimiento, "id" | "creado_en">;
export type UpdateMovimientoInput = Partial<CreateMovimientoInput> & { id?: number };


