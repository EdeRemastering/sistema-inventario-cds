import { prisma } from "./prisma";
import { unstable_cache } from "next/cache";

// Tipos simplificados para selects
export type SedeOption = {
  id: number;
  nombre: string;
  ciudad: string;
  municipio: string | null;
};

export type UbicacionOption = {
  id: number;
  codigo: string;
  nombre: string;
  sede_id: number;
};

export type CategoriaOption = {
  id: number;
  nombre: string;
};

export type SubcategoriaOption = {
  id: number;
  nombre: string;
  categoria_id: number;
};

export type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  categoria_id: number;
  subcategoria_id: number | null;
  ubicacion_id: number | null;
  ubicacion_rel: {
    id: number;
    codigo: string;
    nombre: string;
    sede: {
      id: number;
      nombre: string;
      ciudad: string;
      municipio: string | null;
    } | null;
  } | null;
};

export type FormSelectOptions = {
  sedes: SedeOption[];
  ubicaciones: UbicacionOption[];
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  elementos: ElementoOption[];
};

// Función que obtiene todas las opciones filtradas (solo con datos relacionados)
async function fetchFormSelectOptions(): Promise<FormSelectOptions> {
  // Obtener IDs de elementos existentes para filtrar
  const elementosConDatos = await prisma.elementos.findMany({
    select: {
      categoria_id: true,
      subcategoria_id: true,
      ubicacion_id: true,
    },
  });

  // Extraer IDs únicos
  const categoriaIds = [...new Set(elementosConDatos.map(e => e.categoria_id))];
  const subcategoriaIds = [...new Set(elementosConDatos.filter(e => e.subcategoria_id).map(e => e.subcategoria_id!))];
  const ubicacionIds = [...new Set(elementosConDatos.filter(e => e.ubicacion_id).map(e => e.ubicacion_id!))];

  // Obtener ubicaciones con elementos para extraer sede_ids
  const ubicacionesConElementos = await prisma.ubicaciones.findMany({
    where: { id: { in: ubicacionIds } },
    select: { sede_id: true },
  });
  const sedeIds = [...new Set(ubicacionesConElementos.map(u => u.sede_id))];

  // Ejecutar todas las consultas en paralelo
  const [sedes, ubicaciones, categorias, subcategorias, elementos] = await Promise.all([
    // Sedes que tienen ubicaciones con elementos
    prisma.sedes.findMany({
      where: {
        activo: true,
        id: { in: sedeIds.length > 0 ? sedeIds : [-1] }, // -1 para que no devuelva nada si está vacío
      },
      select: { id: true, nombre: true, ciudad: true, municipio: true },
      orderBy: { nombre: "asc" },
    }),
    // Ubicaciones que tienen elementos
    prisma.ubicaciones.findMany({
      where: {
        activo: true,
        id: { in: ubicacionIds.length > 0 ? ubicacionIds : [-1] },
      },
      select: { id: true, codigo: true, nombre: true, sede_id: true },
      orderBy: { codigo: "asc" },
    }),
    // Categorías que tienen elementos
    prisma.categorias.findMany({
      where: {
        id: { in: categoriaIds.length > 0 ? categoriaIds : [-1] },
      },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    // Subcategorías que tienen elementos
    prisma.subcategorias.findMany({
      where: {
        id: { in: subcategoriaIds.length > 0 ? subcategoriaIds : [-1] },
      },
      select: { id: true, nombre: true, categoria_id: true },
      orderBy: { nombre: "asc" },
    }),
    // Elementos con relaciones mínimas
    prisma.elementos.findMany({
      select: {
        id: true,
        serie: true,
        marca: true,
        modelo: true,
        categoria_id: true,
        subcategoria_id: true,
        ubicacion_id: true,
        ubicacion_rel: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            sede: {
              select: { id: true, nombre: true, ciudad: true, municipio: true },
            },
          },
        },
      },
      orderBy: { serie: "asc" },
    }),
  ]);

  return {
    sedes: sedes as SedeOption[],
    ubicaciones: ubicaciones as UbicacionOption[],
    categorias: categorias as CategoriaOption[],
    subcategorias: subcategorias as SubcategoriaOption[],
    elementos: elementos as ElementoOption[],
  };
}

// Versión cacheada (revalida cada 60 segundos)
export const getFormSelectOptions = unstable_cache(
  fetchFormSelectOptions,
  ["form-select-options"],
  { revalidate: 60, tags: ["elementos", "form-options"] }
);

// Función para obtener opciones sin filtrar (para páginas de administración)
export async function getAllFormSelectOptions(): Promise<FormSelectOptions> {
  const [sedes, ubicaciones, categorias, subcategorias, elementos] = await Promise.all([
    prisma.sedes.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, ciudad: true, municipio: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.ubicaciones.findMany({
      where: { activo: true },
      select: { id: true, codigo: true, nombre: true, sede_id: true },
      orderBy: { codigo: "asc" },
    }),
    prisma.categorias.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.subcategorias.findMany({
      select: { id: true, nombre: true, categoria_id: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.elementos.findMany({
      select: {
        id: true,
        serie: true,
        marca: true,
        modelo: true,
        categoria_id: true,
        subcategoria_id: true,
        ubicacion_id: true,
        ubicacion_rel: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            sede: {
              select: { id: true, nombre: true, ciudad: true, municipio: true },
            },
          },
        },
      },
      orderBy: { serie: "asc" },
    }),
  ]);

  return {
    sedes: sedes as SedeOption[],
    ubicaciones: ubicaciones as UbicacionOption[],
    categorias: categorias as CategoriaOption[],
    subcategorias: subcategorias as SubcategoriaOption[],
    elementos: elementos as ElementoOption[],
  };
}


