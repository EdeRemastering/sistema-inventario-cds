export type Ticket = {
  id: number;
  numero_ticket: string;
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
  hora_entrega: Date | null;
  hora_devolucion: Date | null;
  creado_en: Date;
  firma_devuelve: string | null;
  firma_recibe_devolucion: string | null;
  devuelto_por: string | null;
  recibido_por: string | null;
  ticket_elementos?: TicketElemento[];
};

export type TicketElemento = {
  id: number;
  ticket_id: number;
  elemento_id: number;
  cantidad: number;
  elemento?: {
    id: number;
    serie: string;
    marca: string | null;
    modelo: string | null;
    categoria: {
      nombre: string;
    };
    subcategoria?: {
      nombre: string;
    } | null;
  };
};

export type CreateTicketInput = Omit<Ticket, "id" | "creado_en" | "ticket_elementos"> & {
  elementos: {
    elemento_id: number;
    cantidad: number;
  }[];
};

export type UpdateTicketInput = Partial<CreateTicketInput>;

export type TicketWithElementos = Ticket & {
  ticket_elementos: (TicketElemento & {
    elemento: {
      id: number;
      serie: string;
      marca: string | null;
      modelo: string | null;
      categoria: {
        nombre: string;
      };
      subcategoria?: {
        nombre: string;
      } | null;
    };
  })[];
};
