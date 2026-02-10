import { notFound } from "next/navigation";
import Link from "next/link";
import { getElemento } from "@/modules/elementos/services";
import { getHojaVidaByElemento } from "@/modules/hojas_vida/services";
import { listObservacionesByElemento } from "@/modules/observaciones/services";
import { listMantenimientosRealizadosByElemento } from "@/modules/mantenimientos/services";
import { getFormSelectOptions } from "@/lib/form-options";
import {
  actionUpdateHojaVida,
  actionCreateCambioElemento,
  actionUpdateCambioElemento,
  actionDeleteCambioElemento,
} from "@/modules/hojas_vida/actions";
import {
  actionCreateObservacion,
  actionUpdateObservacion,
  actionDeleteObservacion,
} from "@/modules/observaciones/actions";
import { HojaVidaElementoDetail } from "@/components/hojas-vida/hoja-vida-elemento-detail";
import type { HojaVida } from "@/modules/hojas_vida/types";
import type { Observacion } from "@/modules/observaciones/types";
import type { CambioElemento } from "@/modules/hojas_vida/types";
import type { MantenimientoRealizado } from "@/modules/mantenimientos/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export type HistorialItem = {
  tipo: "observacion" | "cambio" | "mantenimiento";
  fecha: string;
  id: number;
  descripcion: string;
  tipo_cambio?: string;
  tipo_mantenimiento?: string;
  usuario?: string | null;
  responsable?: string;
};

type PageProps = { params: Promise<{ elementoId: string }> };

export default async function HojaVidaElementoPage({ params }: PageProps) {
  const { elementoId } = await params;
  const id = parseInt(elementoId, 10);
  if (!Number.isFinite(id)) notFound();

  const [elemento, hojaVida, observaciones, mantenimientos, options] =
    await Promise.all([
      getElemento(id),
      getHojaVidaByElemento(id),
      listObservacionesByElemento(id),
      listMantenimientosRealizadosByElemento(id),
      getFormSelectOptions(),
    ]);

  if (!elemento) notFound();

  const cambios = (hojaVida?.cambios ?? []).map(
    (c: CambioElemento & { costo?: unknown }) => ({
      ...c,
      costo: c.costo != null ? Number(c.costo) : null,
    })
  );
  const historial: HistorialItem[] = [
    ...observaciones.map((o: Observacion) => ({
      tipo: "observacion" as const,
      fecha:
        typeof o.fecha_observacion === "string"
          ? o.fecha_observacion
          : o.fecha_observacion?.toISOString?.() ?? "",
      id: o.id,
      descripcion: o.descripcion,
    })),
    ...cambios.map((c: CambioElemento) => ({
      tipo: "cambio" as const,
      fecha:
        typeof c.fecha_cambio === "string"
          ? c.fecha_cambio
          : c.fecha_cambio?.toISOString?.() ?? "",
      id: c.id,
      descripcion: c.descripcion_cambio,
      tipo_cambio: c.tipo_cambio,
      usuario: c.usuario,
    })),
    ...mantenimientos.map((m: MantenimientoRealizado) => ({
      tipo: "mantenimiento" as const,
      fecha:
        typeof m.fecha_mantenimiento === "string"
          ? m.fecha_mantenimiento
          : m.fecha_mantenimiento?.toISOString?.() ?? "",
      id: m.id,
      descripcion: m.descripcion,
      tipo_mantenimiento: m.tipo,
      responsable: m.responsable,
    })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/hojas-vida">
            <ChevronLeft className="h-4 w-4" />
            Volver a Hojas de Vida
          </Link>
        </Button>
      </div>
      <HojaVidaElementoDetail
        elemento={
          elemento as {
            id: number;
            serie: string;
            marca: string | null;
            modelo: string | null;
            codigo_equipo?: string | null;
          }
        }
        hojaVida={hojaVida as HojaVida | null}
        observaciones={observaciones}
        cambios={cambios}
        mantenimientos={mantenimientos}
        historial={historial}
        formOptions={options}
        onCreateObservacion={actionCreateObservacion}
        onUpdateObservacion={actionUpdateObservacion}
        onDeleteObservacion={actionDeleteObservacion}
        onCreateCambio={actionCreateCambioElemento}
        onUpdateCambio={actionUpdateCambioElemento}
        onDeleteCambio={actionDeleteCambioElemento}
        onUpdateHojaVida={actionUpdateHojaVida}
      />
    </div>
  );
}
