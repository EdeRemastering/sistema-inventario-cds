"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CategoriaOption,
  SedeOption,
  SubcategoriaOption,
  UbicacionOption,
} from "@/lib/form-options";

function toYmd(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function MantenimientosKpisFilters({
  initialFrom,
  initialTo,
  years,
  initialYear,
  sedes,
  ubicaciones,
  categorias,
  subcategorias,
  initialSedeId,
  initialUbicacionId,
  initialCategoriaId,
  initialSubcategoriaId,
}: {
  initialFrom: Date;
  initialTo: Date;
  years: number[];
  initialYear: number;
  sedes: SedeOption[];
  ubicaciones: UbicacionOption[];
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  initialSedeId?: number;
  initialUbicacionId?: number;
  initialCategoriaId?: number;
  initialSubcategoriaId?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [range, setRange] = useState<DateRange>({
    from: initialFrom,
    to: initialTo,
  });
  const [year, setYear] = useState<string>(String(initialYear));
  const [sedeId, setSedeId] = useState<string>(
    initialSedeId ? String(initialSedeId) : ""
  );
  const [ubicacionId, setUbicacionId] = useState<string>(
    initialUbicacionId ? String(initialUbicacionId) : ""
  );
  const [categoriaId, setCategoriaId] = useState<string>(
    initialCategoriaId ? String(initialCategoriaId) : ""
  );
  const [subcategoriaId, setSubcategoriaId] = useState<string>(
    initialSubcategoriaId ? String(initialSubcategoriaId) : ""
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const canApply = Boolean(range.from && range.to);

  const currentQuery = useMemo(() => {
    const sp = new URLSearchParams(searchParams.toString());
    return sp;
  }, [searchParams]);

  const filteredUbicaciones = useMemo(() => {
    if (!sedeId) return ubicaciones;
    const sid = Number(sedeId);
    return ubicaciones.filter((u) => u.sede_id === sid);
  }, [sedeId, ubicaciones]);

  const filteredSubcategorias = useMemo(() => {
    if (!categoriaId) return subcategorias;
    const cid = Number(categoriaId);
    return subcategorias.filter((s) => s.categoria_id === cid);
  }, [categoriaId, subcategorias]);

  const applyQuery = (sp: URLSearchParams) => {
    if (sedeId) sp.set("sede", sedeId);
    else sp.delete("sede");
    if (ubicacionId) sp.set("ubicacion", ubicacionId);
    else sp.delete("ubicacion");
    if (categoriaId) sp.set("categoria", categoriaId);
    else sp.delete("categoria");
    if (subcategoriaId) sp.set("subcategoria", subcategoriaId);
    else sp.delete("subcategoria");
  };

  if (!mounted) {
    return (
      <div className="flex flex-col gap-3" data-tour="kpis-filters">
        <div className="grid w-full gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-16 rounded bg-muted animate-pulse" />
              <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" data-tour="kpis-filters">
      <div className="grid w-full gap-3 lg:grid-cols-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Periodo</div>
          <DateRangePicker
            value={range}
            onValueChange={(r) =>
              setRange(r ?? { from: undefined, to: undefined })
            }
          />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Año (para gráfica mes a mes)
          </div>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona año" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Sede</div>
          <Select
            value={sedeId || "all"}
            onValueChange={(v) => {
              const next = v === "all" ? "" : v;
              setSedeId(next);
              // Si cambia sede, limpiamos ubicación para evitar combinaciones inválidas.
              setUbicacionId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {sedes.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Ubicación</div>
          <Select
            value={ubicacionId || "all"}
            onValueChange={(v) => setUbicacionId(v === "all" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {filteredUbicaciones.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.codigo} - {u.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid w-full gap-3 lg:grid-cols-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Categoría</div>
          <Select
            value={categoriaId || "all"}
            onValueChange={(v) => {
              const next = v === "all" ? "" : v;
              setCategoriaId(next);
              // Si cambia categoría, limpiamos subcategoría.
              setSubcategoriaId("");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Subcategoría</div>
          <Select
            value={subcategoriaId || "all"}
            onValueChange={(v) => setSubcategoriaId(v === "all" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {filteredSubcategorias.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="lg:col-span-2 flex gap-2 items-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const now = new Date();
              const from = new Date(now.getFullYear(), 0, 1);
              const to = now;
              const sp = new URLSearchParams(currentQuery.toString());
              sp.set("from", toYmd(from));
              sp.set("to", toYmd(to));
              sp.set("year", String(now.getFullYear()));
              applyQuery(sp);
              router.push(`${pathname}?${sp.toString()}`);
            }}
          >
            Año actual
          </Button>
          <Button
            type="button"
            disabled={!canApply}
            onClick={() => {
              if (!range.from || !range.to) return;
              const sp = new URLSearchParams(currentQuery.toString());
              sp.set("from", toYmd(range.from));
              sp.set("to", toYmd(range.to));
              sp.set("year", year);
              applyQuery(sp);
              router.push(`${pathname}?${sp.toString()}`);
            }}
          >
            Aplicar
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Tip: puedes combinar filtros (por ejemplo Sede + Categoría) para ver un
        análisis específico.
      </div>
    </div>
  );
}
