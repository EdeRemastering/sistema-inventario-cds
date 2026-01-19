"use client";

import { useMemo, useState, useCallback } from "react";

type CascadeOption = {
  id: number;
  nombre?: string;
  categoria_id?: number;
  subcategoria_id?: number | null;
  ubicacion_id?: number | null;
  sede_id?: number;
  [key: string]: unknown;
};

type CascadeConfig = {
  categorias: CascadeOption[];
  subcategorias: CascadeOption[];
  sedes: CascadeOption[];
  ubicaciones: CascadeOption[];
  elementos: CascadeOption[];
};

type FilterState = {
  categoriaId: string;
  subcategoriaId: string;
  sedeId: string;
  ubicacionId: string;
};

/**
 * Hook para manejar filtros en cascada con verificación de datos anidados.
 * Deshabilita opciones que no tienen elementos hijos.
 */
export function useCascadingFilters(config: CascadeConfig) {
  const { categorias, subcategorias, sedes, ubicaciones, elementos } = config;

  const [filters, setFilters] = useState<FilterState>({
    categoriaId: "",
    subcategoriaId: "",
    sedeId: "",
    ubicacionId: "",
  });

  // Mapear qué categorías tienen elementos
  const categoriasConElementos = useMemo(() => {
    const set = new Set<number>();
    elementos.forEach((e) => {
      if (e.categoria_id) set.add(e.categoria_id);
    });
    return set;
  }, [elementos]);

  // Mapear qué subcategorías tienen elementos
  const subcategoriasConElementos = useMemo(() => {
    const set = new Set<number>();
    elementos.forEach((e) => {
      if (e.subcategoria_id) set.add(e.subcategoria_id);
    });
    return set;
  }, [elementos]);

  // Mapear qué ubicaciones tienen elementos
  const ubicacionesConElementos = useMemo(() => {
    const set = new Set<number>();
    elementos.forEach((e) => {
      if (e.ubicacion_id) set.add(e.ubicacion_id);
    });
    return set;
  }, [elementos]);

  // Mapear qué sedes tienen elementos (a través de ubicaciones)
  const sedesConElementos = useMemo(() => {
    const set = new Set<number>();
    elementos.forEach((e) => {
      if (e.ubicacion_id) {
        const ubi = ubicaciones.find((u) => u.id === e.ubicacion_id);
        if (ubi?.sede_id) set.add(ubi.sede_id);
      }
    });
    return set;
  }, [elementos, ubicaciones]);

  // Categorías con estado habilitado/deshabilitado
  const categoriasOptions = useMemo(() => {
    return categorias.map((cat) => ({
      ...cat,
      hasData: categoriasConElementos.has(cat.id),
      disabled: !categoriasConElementos.has(cat.id),
    }));
  }, [categorias, categoriasConElementos]);

  // Subcategorías filtradas por categoría seleccionada
  const subcategoriasOptions = useMemo(() => {
    const catId = filters.categoriaId ? parseInt(filters.categoriaId) : null;
    
    return subcategorias
      .filter((sub) => !catId || sub.categoria_id === catId)
      .map((sub) => ({
        ...sub,
        hasData: subcategoriasConElementos.has(sub.id),
        disabled: !subcategoriasConElementos.has(sub.id),
      }));
  }, [subcategorias, filters.categoriaId, subcategoriasConElementos]);

  // Sedes con estado habilitado/deshabilitado
  const sedesOptions = useMemo(() => {
    return sedes.map((sede) => ({
      ...sede,
      hasData: sedesConElementos.has(sede.id),
      disabled: !sedesConElementos.has(sede.id),
    }));
  }, [sedes, sedesConElementos]);

  // Ubicaciones filtradas por sede seleccionada
  const ubicacionesOptions = useMemo(() => {
    const sedeId = filters.sedeId ? parseInt(filters.sedeId) : null;

    return ubicaciones
      .filter((ubi) => !sedeId || ubi.sede_id === sedeId)
      .map((ubi) => ({
        ...ubi,
        hasData: ubicacionesConElementos.has(ubi.id),
        disabled: !ubicacionesConElementos.has(ubi.id),
      }));
  }, [ubicaciones, filters.sedeId, ubicacionesConElementos]);

  // Elementos filtrados por todos los criterios
  const elementosFiltrados = useMemo(() => {
    return elementos.filter((e) => {
      if (filters.categoriaId && e.categoria_id !== parseInt(filters.categoriaId)) {
        return false;
      }
      if (filters.subcategoriaId && e.subcategoria_id !== parseInt(filters.subcategoriaId)) {
        return false;
      }
      if (filters.ubicacionId && e.ubicacion_id !== parseInt(filters.ubicacionId)) {
        return false;
      }
      // Filtrar por sede (a través de ubicación)
      if (filters.sedeId) {
        const ubi = ubicaciones.find((u) => u.id === e.ubicacion_id);
        if (!ubi || ubi.sede_id !== parseInt(filters.sedeId)) {
          return false;
        }
      }
      return true;
    });
  }, [elementos, filters, ubicaciones]);

  // Handlers para cambiar filtros
  const setCategoria = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      categoriaId: value,
      subcategoriaId: "", // Reset subcategoría al cambiar categoría
    }));
  }, []);

  const setSubcategoria = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      subcategoriaId: value,
    }));
  }, []);

  const setSede = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      sedeId: value,
      ubicacionId: "", // Reset ubicación al cambiar sede
    }));
  }, []);

  const setUbicacion = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      ubicacionId: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      categoriaId: "",
      subcategoriaId: "",
      sedeId: "",
      ubicacionId: "",
    });
  }, []);

  return {
    filters,
    setFilters,
    setCategoria,
    setSubcategoria,
    setSede,
    setUbicacion,
    resetFilters,
    options: {
      categorias: categoriasOptions,
      subcategorias: subcategoriasOptions,
      sedes: sedesOptions,
      ubicaciones: ubicacionesOptions,
    },
    elementosFiltrados,
    stats: {
      totalElementos: elementos.length,
      elementosFiltrados: elementosFiltrados.length,
      categoriasConDatos: categoriasConElementos.size,
      subcategoriasConDatos: subcategoriasConElementos.size,
      sedesConDatos: sedesConElementos.size,
      ubicacionesConDatos: ubicacionesConElementos.size,
    },
  };
}

/**
 * Función helper para determinar si una opción debe estar deshabilitada
 */
export function shouldDisableOption(
  optionId: number,
  dataSet: Set<number>
): boolean {
  return !dataSet.has(optionId);
}

/**
 * Componente helper para mostrar un SelectItem con estado deshabilitado
 */
export function getOptionClassName(hasData: boolean): string {
  return hasData
    ? ""
    : "text-muted-foreground opacity-60 cursor-not-allowed";
}
