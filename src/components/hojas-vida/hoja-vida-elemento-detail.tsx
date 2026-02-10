"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HojaVidaUpsertDialog } from "./hoja-vida-upsert-dialog";
import { ObservacionUpsertDialog } from "../observaciones/observacion-upsert-dialog";
import { CambioElementoUpsertDialog } from "./cambio-elemento-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { HojaVida } from "@/modules/hojas_vida/types";
import type { Observacion } from "@/modules/observaciones/types";
import type { CambioElemento } from "@/modules/hojas_vida/types";
import type { MantenimientoRealizado } from "@/modules/mantenimientos/types";
import type { HistorialItem } from "@/app/(main)/hojas-vida/elemento/[elementoId]/page";
import type { FormSelectOptions } from "@/lib/form-options";

type ElementoBasic = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  codigo_equipo?: string | null;
};

type Props = {
  elemento: ElementoBasic;
  hojaVida: HojaVida | null;
  observaciones: Observacion[];
  cambios: CambioElemento[];
  mantenimientos: MantenimientoRealizado[];
  historial: HistorialItem[];
  formOptions: FormSelectOptions;
  onCreateObservacion?: (formData: FormData) => Promise<void>;
  onUpdateObservacion?: (formData: FormData) => Promise<void>;
  onDeleteObservacion?: (id: number) => Promise<void>;
  onCreateCambio?: (formData: FormData) => Promise<void>;
  onUpdateCambio?: (formData: FormData) => Promise<void>;
  onDeleteCambio?: (id: number) => Promise<void>;
  onUpdateHojaVida?: (formData: FormData) => Promise<void>;
};

function parseDate(d: Date | string): Date {
  if (typeof d === "string") return new Date(d);
  return d;
}

export function HojaVidaElementoDetail({
  elemento,
  hojaVida,
  observaciones,
  cambios,
  mantenimientos,
  historial,
  formOptions,
  onCreateObservacion,
  onUpdateObservacion,
  onDeleteObservacion,
  onCreateCambio,
  onUpdateCambio,
  onDeleteCambio,
  onUpdateHojaVida,
}: Props) {
  const [editingHojaVida, setEditingHojaVida] = useState<HojaVida | null>(null);
  const [editingObservacion, setEditingObservacion] =
    useState<Observacion | null>(null);
  const [editingCambio, setEditingCambio] = useState<CambioElemento | null>(
    null
  );

  const elementoOption = {
    id: elemento.id,
    serie: elemento.serie,
    marca: elemento.marca,
    modelo: elemento.modelo,
  };
  const elementosForObservacion = [elementoOption];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Hoja de vida: {elemento.serie}
          {elemento.codigo_equipo && (
            <span className="text-muted-foreground font-normal ml-2">
              ({elemento.codigo_equipo})
            </span>
          )}
        </h1>
        <p className="text-muted-foreground text-sm">
          {elemento.marca} {elemento.modelo}
        </p>
      </div>

      <Card className="bg-muted/40 border-muted-foreground/20">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-medium mb-2">¿Qué es cada cosa?</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>
              <strong className="text-foreground">Observación:</strong> algo que
              se observa o se encuentra en el elemento (nota, hallazgo,
              condición). No implica que se haya hecho una intervención.
            </li>
            <li>
              <strong className="text-foreground">Cambio:</strong> algo que el
              equipo
              <em> sufrió</em> o se le hizo (ej. se le cambió el cable,
              reparación, mejora, reemplazo). Puede hacerse sin estar dentro de
              un mantenimiento programado.
            </li>
            <li>
              <strong className="text-foreground">Mantenimiento:</strong>{" "}
              actividad formal de mantenimiento (preventivo, correctivo,
              predictivo) que se programa en el cronograma o se registra como
              realizada en Mantenimientos.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Tabs defaultValue="datos" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="datos">Datos</TabsTrigger>
          <TabsTrigger value="observaciones">
            Observaciones ({observaciones.length})
          </TabsTrigger>
          <TabsTrigger value="cambios">Cambios ({cambios.length})</TabsTrigger>
          <TabsTrigger value="mantenimientos">
            Mantenimientos ({mantenimientos.length})
          </TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Datos de la hoja de vida</CardTitle>
              {hojaVida && onUpdateHojaVida && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingHojaVida(hojaVida)}
                >
                  Editar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!hojaVida ? (
                <p className="text-muted-foreground text-sm">
                  No hay hoja de vida para este elemento. Usa &quot;Crear hojas
                  de vida faltantes&quot; en la lista de hojas de vida.
                </p>
              ) : (
                <dl className="grid gap-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Tipo</dt>
                    <dd>
                      {hojaVida.tipo_elemento === "EQUIPO"
                        ? "Equipo"
                        : "Recurso didáctico"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      Fecha diligenciamiento
                    </dt>
                    <dd>
                      {format(
                        parseDate(hojaVida.fecha_dilegenciamiento),
                        "dd/MM/yyyy",
                        { locale: es }
                      )}
                    </dd>
                  </div>
                  {hojaVida.responsable && (
                    <div>
                      <dt className="text-muted-foreground">Responsable</dt>
                      <dd>{hojaVida.responsable}</dd>
                    </div>
                  )}
                  {hojaVida.area_ubicacion && (
                    <div>
                      <dt className="text-muted-foreground">
                        Área / Ubicación
                      </dt>
                      <dd>{hojaVida.area_ubicacion}</dd>
                    </div>
                  )}
                  {hojaVida.descripcion && (
                    <div>
                      <dt className="text-muted-foreground">Descripción</dt>
                      <dd className="whitespace-pre-wrap">
                        {hojaVida.descripcion}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </CardContent>
          </Card>

          {editingHojaVida && hojaVida && onUpdateHojaVida && (
            <HojaVidaUpsertDialog
              serverAction={onUpdateHojaVida}
              create={false}
              defaultValues={{
                ...editingHojaVida,
                fecha_dilegenciamiento: parseDate(
                  editingHojaVida.fecha_dilegenciamiento
                ),
                fecha_actualizacion: editingHojaVida.fecha_actualizacion
                  ? parseDate(editingHojaVida.fecha_actualizacion)
                  : undefined,
              }}
              elementos={formOptions.elementos}
              sedes={formOptions.sedes}
              ubicaciones={formOptions.ubicaciones}
              categorias={formOptions.categorias}
              subcategorias={formOptions.subcategorias}
              hiddenFields={{ id: editingHojaVida.id }}
              onClose={() => setEditingHojaVida(null)}
            />
          )}
        </TabsContent>

        <TabsContent value="observaciones" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Observaciones del elemento</CardTitle>
              {onCreateObservacion && (
                <ObservacionUpsertDialog
                  create
                  serverAction={onCreateObservacion}
                  elementos={elementosForObservacion}
                  defaultValues={{ elemento_id: String(elemento.id) }}
                />
              )}
            </CardHeader>
            <CardContent>
              {observaciones.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay observaciones.
                </p>
              ) : (
                <ul className="space-y-3">
                  {observaciones.map((obs) => (
                    <li
                      key={obs.id}
                      className="flex items-start justify-between gap-2 rounded border p-3"
                    >
                      <div className="text-sm flex-1 min-w-0">
                        <p className="font-medium">{obs.descripcion}</p>
                        <p className="text-muted-foreground text-xs">
                          {format(
                            parseDate(obs.fecha_observacion),
                            "dd/MM/yyyy",
                            { locale: es }
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {onUpdateObservacion && (
                          <ObservacionUpsertDialog
                            create={false}
                            serverAction={onUpdateObservacion}
                            elementos={elementosForObservacion}
                            defaultValues={{
                              elemento_id: String(obs.elemento_id),
                              fecha_observacion: new Date(
                                obs.fecha_observacion as Date | string
                              )
                                .toISOString()
                                .slice(0, 16),
                              descripcion: obs.descripcion,
                            }}
                            hiddenFields={{ id: obs.id }}
                          />
                        )}
                        {onDeleteObservacion && (
                          <DeleteButton
                            onConfirm={async () => {
                              await onDeleteObservacion(obs.id);
                            }}
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cambios" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cambios registrados</CardTitle>
              {hojaVida && onCreateCambio && (
                <CambioElementoUpsertDialog
                  create
                  serverAction={onCreateCambio!}
                  hoja_vida_id={hojaVida.id}
                />
              )}
            </CardHeader>
            <CardContent>
              {cambios.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay cambios registrados.
                  {!hojaVida &&
                    " La hoja de vida es necesaria para agregar cambios."}
                </p>
              ) : (
                <ul className="space-y-3">
                  {cambios.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-start justify-between gap-2 rounded border p-3"
                    >
                      <div className="text-sm flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{c.tipo_cambio}</Badge>
                          {c.usuario && (
                            <span className="text-muted-foreground text-xs">
                              {c.usuario}
                            </span>
                          )}
                        </div>
                        <p className="mt-1">{c.descripcion_cambio}</p>
                        <p className="text-muted-foreground text-xs">
                          {format(parseDate(c.fecha_cambio), "dd/MM/yyyy", {
                            locale: es,
                          })}
                          {c.costo != null && Number(c.costo) > 0 && (
                            <span className="ml-2">
                              · Costo:{" "}
                              {new Intl.NumberFormat("es-CO", {
                                style: "currency",
                                currency: "COP",
                              }).format(Number(c.costo))}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {onUpdateCambio && (
                          <CambioElementoUpsertDialog
                            create={false}
                            serverAction={onUpdateCambio!}
                            hoja_vida_id={c.hoja_vida_id}
                            defaultValues={{
                              id: c.id,
                              hoja_vida_id: c.hoja_vida_id,
                              fecha_cambio: format(
                                parseDate(c.fecha_cambio as Date | string),
                                "yyyy-MM-dd"
                              ),
                              descripcion_cambio: c.descripcion_cambio,
                              tipo_cambio: c.tipo_cambio,
                              usuario: c.usuario ?? "",
                              costo: c.costo != null ? Number(c.costo) : null,
                            }}
                            hiddenFields={{ id: c.id }}
                          />
                        )}
                        {onDeleteCambio && (
                          <DeleteButton
                            onConfirm={async () => {
                              await onDeleteCambio(c.id);
                            }}
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mantenimientos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos realizados</CardTitle>
            </CardHeader>
            <CardContent>
              {mantenimientos.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay mantenimientos realizados.
                </p>
              ) : (
                <ul className="space-y-3">
                  {mantenimientos.map((m) => (
                    <li key={m.id} className="rounded border p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            m.tipo === "PREVENTIVO"
                              ? "default"
                              : m.tipo === "CORRECTIVO"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {m.tipo}
                        </Badge>
                        <span className="text-muted-foreground">
                          {format(
                            parseDate(m.fecha_mantenimiento),
                            "dd/MM/yyyy",
                            { locale: es }
                          )}
                        </span>
                        {m.responsable && (
                          <span className="text-muted-foreground">
                            · {m.responsable}
                          </span>
                        )}
                      </div>
                      <p className="mt-1">{m.descripcion}</p>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/mantenimientos">Ir a Mantenimientos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial del elemento</CardTitle>
              <p className="text-muted-foreground text-sm">
                Observaciones, cambios y mantenimientos ordenados por fecha.
              </p>
            </CardHeader>
            <CardContent>
              {historial.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay registros en el historial.
                </p>
              ) : (
                <ul className="space-y-4">
                  {historial.map((item, idx) => (
                    <li
                      key={`${item.tipo}-${item.id}`}
                      className="flex gap-3 border-l-2 pl-4 py-1 border-muted"
                    >
                      <div className="text-muted-foreground text-xs w-24 flex-shrink-0">
                        {format(parseDate(item.fecha), "dd/MM/yyyy", {
                          locale: es,
                        })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge
                          variant={
                            item.tipo === "observacion"
                              ? "outline"
                              : item.tipo === "cambio"
                              ? "secondary"
                              : "default"
                          }
                          className="mb-1"
                        >
                          {item.tipo === "observacion"
                            ? "Observación"
                            : item.tipo === "cambio"
                            ? item.tipo_cambio ?? "Cambio"
                            : item.tipo_mantenimiento ?? "Mantenimiento"}
                        </Badge>
                        <p className="text-sm">{item.descripcion}</p>
                        {(item.usuario || item.responsable) && (
                          <p className="text-muted-foreground text-xs mt-0.5">
                            {item.usuario ?? item.responsable}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
