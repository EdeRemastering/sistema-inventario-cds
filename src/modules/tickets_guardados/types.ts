export type TicketElemento = {
  id: number;
  ticket_id: number;
  elemento_id: number;
  cantidad: number;
  elemento_nombre: string | null;
  serie: string | null;
  marca_modelo: string | null;
  creado_en: Date;
  elemento?: {
    id: number;
    serie: string;
    marca?: string | null;
    modelo?: string | null;
    categoria: {
      nombre: string;
    };
    subcategoria?: {
      nombre: string;
    } | null;
  };
};

export type TicketGuardado = {
  id: number;
  numero_ticket: string;
  fecha_salida: Date;
  fecha_estimada_devolucion: Date | null;
  dependencia_entrega: string | null;
  firma_funcionario_entrega: string | null;
  dependencia_recibe: string | null;
  firma_funcionario_recibe: string | null;
  motivo: string | null;
  orden_numero: string | null;
  fecha_guardado: Date | null;
  usuario_guardado: string | null;
  ticket_elementos?: TicketElemento[];
};

export type CreateTicketInput = Omit<TicketGuardado, "id" | "ticket_elementos"> & {
  ticket_elementos?: Omit<TicketElemento, "id" | "ticket_id" | "creado_en">[];
};

export type ElementoFormData = {
  elemento_id: number;
  cantidad: number;
  elemento_nombre?: string;
  serie?: string;
  marca_modelo?: string;
};


