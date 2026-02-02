"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type ElementoDetails = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  cantidad: number;
  imagen_url: string | null;
  categoria: { id: number; nombre: string } | null;
  subcategoria: { id: number; nombre: string } | null;
  ubicacion_rel: {
    id: number;
    codigo: string;
    nombre: string;
    sede: { id: number; nombre: string; ciudad: string; municipio: string | null } | null;
  } | null;
  ubicacion: string | null;
  ubicacion_id: number | null;
  estado_funcional: string;
  estado_fisico: string;
  fecha_entrada: string;
  fecha_salida: string | null;
  codigo_equipo: string | null;
  especificaciones: unknown;
  observaciones: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
};

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

export function ElementoDetailDialog({
  elementoId,
  open,
  onOpenChange,
}: {
  elementoId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ElementoDetails | null>(null);

  useEffect(() => {
    if (!open || !elementoId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/elementos/${elementoId}`, { method: "GET" })
      .then(async (r) => {
        const json = (await r.json()) as any;
        if (!r.ok) throw new Error(json?.error || "No se pudo cargar el elemento");
        return json as ElementoDetails;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Error cargando detalles");
        setData(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, elementoId]);

  const title = useMemo(() => {
    if (!data) return "Detalle del elemento";
    return `Elemento #${data.id} · ${data.serie}`;
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-[240px_1fr]">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="aspect-square w-full max-w-[240px]" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <div className="font-medium text-destructive">No se pudo cargar</div>
            <div className="text-muted-foreground">{error}</div>
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!elementoId) return;
                  setData(null);
                  setError(null);
                  setLoading(true);
                  fetch(`/api/elementos/${elementoId}`)
                    .then(async (r) => {
                      const json = (await r.json()) as any;
                      if (!r.ok) throw new Error(json?.error || "No se pudo cargar");
                      return json as ElementoDetails;
                    })
                    .then((json) => setData(json))
                    .catch((e) =>
                      setError(e instanceof Error ? e.message : "Error cargando detalles")
                    )
                    .finally(() => setLoading(false));
                }}
              >
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-[240px_1fr]">
              <div className="space-y-2">
                <div className="text-sm font-medium">Imagen</div>
                {data.imagen_url ? (
                  <div className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={data.imagen_url}
                      alt={`Imagen del elemento ${data.serie}`}
                      fill
                      className="object-cover"
                      sizes="240px"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    Sin imagen
                  </div>
                )}
                <div className="flex gap-2">
                  <Badge variant={data.activo ? "default" : "secondary"}>
                    {data.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Serie" value={data.serie} />
                <Field label="Código de equipo" value={data.codigo_equipo || "—"} />
                <Field label="Marca" value={data.marca || "—"} />
                <Field label="Modelo" value={data.modelo || "—"} />
                <Field label="Cantidad" value={data.cantidad} />
                <Field label="Categoría" value={data.categoria?.nombre || "—"} />
                <Field label="Subcategoría" value={data.subcategoria?.nombre || "—"} />
                <Field
                  label="Ubicación"
                  value={
                    data.ubicacion_rel
                      ? `${data.ubicacion_rel.codigo} · ${data.ubicacion_rel.nombre}`
                      : data.ubicacion || "—"
                  }
                />
                <Field
                  label="Sede"
                  value={
                    data.ubicacion_rel?.sede
                      ? `${data.ubicacion_rel.sede.nombre} (${data.ubicacion_rel.sede.ciudad}${
                          data.ubicacion_rel.sede.municipio
                            ? `, ${data.ubicacion_rel.sede.municipio}`
                            : ""
                        })`
                      : "—"
                  }
                />
                <Field label="Estado funcional" value={data.estado_funcional || "—"} />
                <Field label="Estado físico" value={data.estado_fisico || "—"} />
                <Field label="Fecha de entrada" value={fmtDate(data.fecha_entrada)} />
                <Field label="Fecha de salida" value={fmtDate(data.fecha_salida)} />
                <Field label="Creado" value={fmtDate(data.creado_en)} />
                <Field label="Actualizado" value={fmtDate(data.actualizado_en)} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label="Observaciones"
                value={
                  data.observaciones ? (
                    <div className="whitespace-pre-wrap">{data.observaciones}</div>
                  ) : (
                    "—"
                  )
                }
              />
              <Field
                label="Especificaciones"
                value={
                  data.especificaciones ? (
                    <pre className="max-h-48 overflow-auto rounded-md border bg-muted p-2 text-xs">
                      {JSON.stringify(data.especificaciones, null, 2)}
                    </pre>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

