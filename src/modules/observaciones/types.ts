export type Observacion = {
  id: number;
  elemento_id: number;
  fecha_observacion: Date;
  descripcion: string;
  creado_en: Date;
};

export type CreateObservacionInput = Omit<Observacion, "id" | "creado_en">;
export type UpdateObservacionInput = Partial<CreateObservacionInput> & { id?: number };


