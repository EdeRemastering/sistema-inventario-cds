export type Ubicacion = {
  id: number;
  codigo: string;
  nombre: string;
  sede_id: number;
  activo: boolean;
  creado_en: Date;
  actualizado_en: Date;
  sede?: {
    id: number;
    nombre: string;
    ciudad: string;
    municipio: string | null;
  };
};

export type CreateUbicacionInput = Omit<Ubicacion, "id" | "creado_en" | "actualizado_en" | "sede">;
export type UpdateUbicacionInput = Partial<CreateUbicacionInput> & { id?: number };


