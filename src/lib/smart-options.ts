import { prisma } from "./prisma";
import { unstable_cache } from "next/cache";

export type SmartOption = {
  value: string;
  label: string;
  disabled: boolean;
  count?: number;
};

export type SmartOptionsData = {
  sedes: SmartOption[];
  ubicaciones: SmartOption[];
  categorias: SmartOption[];
  subcategorias: SmartOption[];
};

/**
 * Obtiene opciones inteligentes para selects, indicando cuáles tienen datos asociados
 */
async function fetchSmartOptions(): Promise<SmartOptionsData> {
  // Obtener conteos de elementos por cada relación
  const [
    elementosPorCategoria,
    elementosPorSubcategoria,
    elementosPorUbicacion,
    sedes,
    ubicaciones,
    categorias,
    subcategorias,
  ] = await Promise.all([
    // Conteo por categoría
    prisma.elementos.groupBy({
      by: ["categoria_id"],
      _count: { id: true },
    }),
    // Conteo por subcategoría
    prisma.elementos.groupBy({
      by: ["subcategoria_id"],
      _count: { id: true },
    }),
    // Conteo por ubicación
    prisma.elementos.groupBy({
      by: ["ubicacion_id"],
      _count: { id: true },
    }),
    // Todas las sedes
    prisma.sedes.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, ciudad: true },
      orderBy: { nombre: "asc" },
    }),
    // Todas las ubicaciones
    prisma.ubicaciones.findMany({
      where: { activo: true },
      select: { id: true, codigo: true, nombre: true, sede_id: true },
      orderBy: { codigo: "asc" },
    }),
    // Todas las categorías
    prisma.categorias.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    }),
    // Todas las subcategorías
    prisma.subcategorias.findMany({
      select: { id: true, nombre: true, categoria_id: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  // Crear mapas de conteo
  const categoriaCount = new Map(
    elementosPorCategoria.map((e) => [e.categoria_id, e._count.id])
  );
  const subcategoriaCount = new Map(
    elementosPorSubcategoria
      .filter((e) => e.subcategoria_id)
      .map((e) => [e.subcategoria_id!, e._count.id])
  );
  const ubicacionCount = new Map(
    elementosPorUbicacion
      .filter((e) => e.ubicacion_id)
      .map((e) => [e.ubicacion_id!, e._count.id])
  );

  // Calcular conteo por sede (suma de elementos en sus ubicaciones)
  const sedeCount = new Map<number, number>();
  for (const ubicacion of ubicaciones) {
    const count = ubicacionCount.get(ubicacion.id) || 0;
    sedeCount.set(ubicacion.sede_id, (sedeCount.get(ubicacion.sede_id) || 0) + count);
  }

  return {
    sedes: sedes.map((s) => ({
      value: s.id.toString(),
      label: `${s.nombre} - ${s.ciudad}`,
      disabled: !sedeCount.has(s.id) || sedeCount.get(s.id) === 0,
      count: sedeCount.get(s.id) || 0,
    })),
    ubicaciones: ubicaciones.map((u) => ({
      value: u.id.toString(),
      label: `${u.codigo} - ${u.nombre}`,
      disabled: !ubicacionCount.has(u.id) || ubicacionCount.get(u.id) === 0,
      count: ubicacionCount.get(u.id) || 0,
    })),
    categorias: categorias.map((c) => ({
      value: c.id.toString(),
      label: c.nombre,
      disabled: !categoriaCount.has(c.id) || categoriaCount.get(c.id) === 0,
      count: categoriaCount.get(c.id) || 0,
    })),
    subcategorias: subcategorias.map((s) => ({
      value: s.id.toString(),
      label: s.nombre,
      disabled: !subcategoriaCount.has(s.id) || subcategoriaCount.get(s.id) === 0,
      count: subcategoriaCount.get(s.id) || 0,
    })),
  };
}

// Versión cacheada
export const getSmartOptions = unstable_cache(
  fetchSmartOptions,
  ["smart-options"],
  { revalidate: 60, tags: ["elementos", "smart-options"] }
);

/**
 * Helper para crear opciones para selects con indicador de datos
 */
export function createSmartSelectOptions(
  options: SmartOption[],
  showCount = false
): { value: string; label: string; disabled?: boolean }[] {
  return options.map((opt) => ({
    value: opt.value,
    label: showCount && opt.count !== undefined
      ? `${opt.label} (${opt.count})`
      : opt.label,
    disabled: opt.disabled,
  }));
}
