export type Subcategoria = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  estado: "activo" | "inactivo";
  created_at: Date;
  updated_at: Date;
};

export type CreateSubcategoriaInput = {
  nombre: string;
  descripcion?: string | null;
  categoria_id: number;
  estado?: "activo" | "inactivo";
};
export type UpdateSubcategoriaInput = Partial<Omit<CreateSubcategoriaInput, "categoria_id">> & { categoria_id?: number };


