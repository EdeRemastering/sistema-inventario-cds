export type MantenimientoProgramado = {
  id: number;
  elemento_id: number;
  fecha_mantenimiento: Date;
  tipo: "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO";
  descripcion: string;
  averias_encontradas: string | null;
  repuestos_utilizados: string | null;
  responsable: string;
  costo: number | null;
  estado: "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO";
  observaciones: string | null;
  creado_por: string | null;
  creado_en: Date;
  actualizado_en: Date;
  elemento?: {
    id: number;
    serie: string;
    marca: string | null;
    modelo: string | null;
  };
};

export type MantenimientoRealizado = {
  id: number;
  elemento_id: number;
  programacion_id: number | null;
  fecha_mantenimiento: Date;
  tipo: "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO";
  descripcion: string;
  averias_encontradas: string | null;
  repuestos_utilizados: string | null;
  responsable: string;
  costo: number | null;
  creado_por: string | null;
  creado_en: Date;
  elemento?: {
    id: number;
    serie: string;
    marca: string | null;
    modelo: string | null;
  };
  programacion?: MantenimientoProgramado | null;
};

export type CreateMantenimientoProgramadoInput = Omit<
  MantenimientoProgramado,
  "id" | "creado_en" | "actualizado_en" | "elemento"
>;
export type UpdateMantenimientoProgramadoInput = Partial<CreateMantenimientoProgramadoInput> & {
  id?: number;
};

export type CreateMantenimientoRealizadoInput = Omit<
  MantenimientoRealizado,
  "id" | "creado_en" | "elemento" | "programacion"
>;
export type UpdateMantenimientoRealizadoInput = Partial<CreateMantenimientoRealizadoInput> & {
  id?: number;
};
