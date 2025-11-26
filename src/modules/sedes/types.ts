export type Sede = {
  id: number;
  nombre: string;
  ciudad: string;
  municipio: string | null;
  activo: boolean;
  creado_en: Date;
  actualizado_en: Date;
};

export type CreateSedeInput = Omit<Sede, "id" | "creado_en" | "actualizado_en">;
export type UpdateSedeInput = Partial<CreateSedeInput> & { id?: number };

