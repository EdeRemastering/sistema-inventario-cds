export type MantenimientoProgramado = {
  id: number;
  elemento_id: number;
  frecuencia: "DIARIO" | "SEMANAL" | "MENSUAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
  año: number;
  enero_semana1: boolean;
  enero_semana2: boolean;
  enero_semana3: boolean;
  enero_semana4: boolean;
  febrero_semana1: boolean;
  febrero_semana2: boolean;
  febrero_semana3: boolean;
  febrero_semana4: boolean;
  marzo_semana1: boolean;
  marzo_semana2: boolean;
  marzo_semana3: boolean;
  marzo_semana4: boolean;
  abril_semana1: boolean;
  abril_semana2: boolean;
  abril_semana3: boolean;
  abril_semana4: boolean;
  mayo_semana1: boolean;
  mayo_semana2: boolean;
  mayo_semana3: boolean;
  mayo_semana4: boolean;
  junio_semana1: boolean;
  junio_semana2: boolean;
  junio_semana3: boolean;
  junio_semana4: boolean;
  julio_semana1: boolean;
  julio_semana2: boolean;
  julio_semana3: boolean;
  julio_semana4: boolean;
  agosto_semana1: boolean;
  agosto_semana2: boolean;
  agosto_semana3: boolean;
  agosto_semana4: boolean;
  septiembre_semana1: boolean;
  septiembre_semana2: boolean;
  septiembre_semana3: boolean;
  septiembre_semana4: boolean;
  octubre_semana1: boolean;
  octubre_semana2: boolean;
  octubre_semana3: boolean;
  octubre_semana4: boolean;
  noviembre_semana1: boolean;
  noviembre_semana2: boolean;
  noviembre_semana3: boolean;
  noviembre_semana4: boolean;
  diciembre_semana1: boolean;
  diciembre_semana2: boolean;
  diciembre_semana3: boolean;
  diciembre_semana4: boolean;
  estado: "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO";
  observaciones: string | null;
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

