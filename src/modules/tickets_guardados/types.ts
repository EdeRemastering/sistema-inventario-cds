export type TicketGuardado = {
  id: number;
  numero_ticket: string;
  fecha_salida: Date;
  fecha_estimada_devolucion: Date | null;
  elemento: string | null;
  serie: string | null;
  marca_modelo: string | null;
  cantidad: number;
  dependencia_entrega: string | null;
  firma_funcionario_entrega: string | null;
  dependencia_recibe: string | null;
  firma_funcionario_recibe: string | null;
  motivo: string | null;
  orden_numero: string | null;
  fecha_guardado: Date | null;
  usuario_guardado: string | null;
};

export type CreateTicketInput = Omit<TicketGuardado, "id">;


