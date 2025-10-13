export type Elemento = {
  id: number;
  categoria_id: number;
  subcategoria_id: number | null;
  cantidad: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  ubicacion: string | null;
  estado_funcional: "B" | "D" | "I" | "FS" | "O" | "R" | "OB";
  estado_fisico: "B" | "D" | "I" | "FS" | "O" | "R" | "OB";
  fecha_entrada: Date;
  codigo_equipo: string | null;
  observaciones: string | null;
  creado_en: Date;
  actualizado_en: Date;
};

export type CreateElementoInput = Omit<Elemento, "id" | "creado_en" | "actualizado_en">;
export type UpdateElementoInput = Partial<CreateElementoInput> & { id?: number };

export type ElementoWithRelations = Elemento & {
  categoria: {
    id: number;
    nombre: string;
    descripcion: string | null;
    estado: string;
    created_at: Date;
    updated_at: Date;
  };
  subcategoria: {
    id: number;
    nombre: string;
    descripcion: string | null;
    categoria_id: number;
    estado: string;
    created_at: Date;
    updated_at: Date;
  } | null;
};


