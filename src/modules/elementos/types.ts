import type { Prisma } from "@prisma/client";

export type Elemento = {
  id: number;
  categoria_id: number;
  subcategoria_id: number | null;
  cantidad: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  ubicacion: string | null; // Mantener para compatibilidad
  ubicacion_id: number | null; // Nueva relación con ubicaciones
  estado_funcional: "B" | "D" | "I" | "FS" | "O" | "R" | "OB";
  estado_fisico: "B" | "D" | "I" | "FS" | "O" | "R" | "OB";
  fecha_entrada: Date;
  fecha_salida: Date | null;
  codigo_equipo: string | null;
  especificaciones: Prisma.JsonValue | null;
  observaciones: string | null;
  imagen_url: string | null;
  activo: boolean;
  creado_en: Date;
  actualizado_en: Date;
  // Relaciones opcionales
  ubicacion_rel?: {
    id: number;
    codigo: string;
    nombre: string;
    sede_id: number;
    sede?: {
      id: number;
      nombre: string;
      ciudad: string;
    };
  } | null;
  categoria?: {
    id: number;
    nombre: string;
  };
  subcategoria?: {
    id: number;
    nombre: string;
  } | null;
};

export type CreateElementoInput = Omit<Elemento, "id" | "creado_en" | "actualizado_en">;
export type UpdateElementoInput = Partial<CreateElementoInput> & { id?: number };

// Tipo para datos de Prisma (maneja campos opcionales correctamente)
type PrismaElementoBase = {
  categoria_id?: number;
  subcategoria_id?: number | null;
  cantidad?: number;
  serie?: string;
  marca?: string | null;
  modelo?: string | null;
  ubicacion?: string | null;
  ubicacion_id?: number | null;
  estado_funcional?: "B" | "D" | "I" | "FS" | "O" | "R" | "OB";
  estado_fisico?: "B" | "D" | "I" | "FS" | "O" | "R" | "OB";
  fecha_entrada?: Date;
  fecha_salida?: Date | null;
  codigo_equipo?: string | null;
  especificaciones?: Record<string, unknown> | null;
  observaciones?: string | null;
  imagen_url?: string | null;
  activo?: boolean;
};

export type PrismaElementoCreateInput = Omit<CreateElementoInput, never>;
export type PrismaElementoUpdateInput = PrismaElementoBase;

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
  ubicacion_rel?: {
    id: number;
    codigo: string;
    nombre: string;
    sede?: {
      id: number;
      nombre: string;
      ciudad: string;
      municipio: string | null;
    } | null;
  } | null;
};


