export type Categoria = {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: "activo" | "inactivo";
  created_at: Date;
  updated_at: Date;
};

export type CreateCategoriaInput = Pick<Categoria, "nombre" | "descripcion" | "estado">;
export type UpdateCategoriaInput = Partial<Pick<Categoria, "nombre" | "descripcion" | "estado">>;


