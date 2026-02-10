"use client";

import { useState, useMemo, useTransition } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Clock,
  X,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import type {
  MantenimientoProgramado,
  SemanaProgramada,
} from "../../modules/mantenimientos/types";
import { getWeekKeyFromDate } from "@/lib/mantenimientos-semanas";
import { MarcarSemanaRealizadaDialog } from "../mantenimientos/marcar-semana-realizada-dialog";

type SedeOption = {
  id: number;
  nombre: string;
  ciudad: string;
  municipio: string | null;
};

type UbicacionOption = {
  id: number;
  codigo: string;
  nombre: string;
  sede_id: number;
};

type ElementoOption = {
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

type RealizadoParaCronograma = {
  id: number;
  elemento_id: number;
  programacion_id: number | null;
  fecha_mantenimiento: Date | string;
};

type Props = {
  sedes: SedeOption[];
  ubicaciones: UbicacionOption[];
  elementos: ElementoOption[];
  mantenimientos: MantenimientoProgramado[];
  realizados?: RealizadoParaCronograma[];
  categorias?: { id: number; nombre: string }[];
  onSetCronograma?: (formData: FormData) => Promise<void>;
  onCreateMantenimiento: (formData: FormData) => Promise<void>;
  onUpdateMantenimiento: (formData: FormData) => Promise<void>;
  onDeleteMantenimiento: (id: number) => Promise<void>;
  onMarcarSemanaRealizada?: (
    programacionId: number,
    weekKey: string
  ) => Promise<void>;
  onCambiarEstado?: (
    id: number,
    estado: "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO"
  ) => Promise<void>;
};

const MESES = [
  { key: "enero", nombre: "ENERO", short: "ENE" },
  { key: "febrero", nombre: "FEBRERO", short: "FEB" },
  { key: "marzo", nombre: "MARZO", short: "MAR" },
  { key: "abril", nombre: "ABRIL", short: "ABR" },
  { key: "mayo", nombre: "MAYO", short: "MAY" },
  { key: "junio", nombre: "JUNIO", short: "JUN" },
  { key: "julio", nombre: "JULIO", short: "JUL" },
  { key: "agosto", nombre: "AGOSTO", short: "AGO" },
  { key: "septiembre", nombre: "SEPTIEMBRE", short: "SEP" },
  { key: "octubre", nombre: "OCTUBRE", short: "OCT" },
  { key: "noviembre", nombre: "NOVIEMBRE", short: "NOV" },
  { key: "diciembre", nombre: "DICIEMBRE", short: "DIC" },
];

const FRECUENCIAS = [
  { value: "DIARIO", label: "Diario" },
  { value: "SEMANAL", label: "Semanal" },
  { value: "MENSUAL", label: "Mensual" },
  { value: "TRIMESTRAL", label: "Trimestral" },
  { value: "SEMESTRAL", label: "Semestral" },
  { value: "ANUAL", label: "Anual" },
];

export function CronogramaView({
  sedes,
  ubicaciones,
  elementos,
  mantenimientos,
  realizados = [],
  onSetCronograma,
  onCreateMantenimiento,
  onUpdateMantenimiento,
  onDeleteMantenimiento,
  onMarcarSemanaRealizada,
  onCambiarEstado,
}: Props) {
  const [selectedSedeId, setSelectedSedeId] = useState<string>("");
  const [selectedUbicacionId, setSelectedUbicacionId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedElemento, setSelectedElemento] =
    useState<ElementoOption | null>(null);
  const [selectedMantenimiento, setSelectedMantenimiento] =
    useState<MantenimientoProgramado | null>(null);
  const [programacionParaMarcar, setProgramacionParaMarcar] =
    useState<MantenimientoProgramado | null>(null);
  const [isPending, startTransition] = useTransition();

  // Estado para el formulario
  const [formSemanas, setFormSemanas] = useState<Record<string, boolean>>({});
  const [formTiposSemana, setFormTiposSemana] = useState<
    Record<string, "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO">
  >({});
  const [tipoPintura, setTipoPintura] = useState<
    "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO"
  >("PREVENTIVO");
  const [formFrecuencia, setFormFrecuencia] = useState<string>("TRIMESTRAL");
  const [formObservaciones, setFormObservaciones] = useState<string>("");

  // Filtrar ubicaciones por sede
  const filteredUbicaciones = useMemo(() => {
    if (!selectedSedeId) return [];
    return ubicaciones.filter((u) => u.sede_id === parseInt(selectedSedeId));
  }, [ubicaciones, selectedSedeId]);

  // Filtrar elementos por ubicación
  const filteredElementos = useMemo(() => {
    if (!selectedUbicacionId) return [];
    return elementos.filter(
      (e) => e.ubicacion_id === parseInt(selectedUbicacionId)
    );
  }, [elementos, selectedUbicacionId]);

  // Obtener mantenimientos del año seleccionado
  const mantenimientosDelAno = useMemo(() => {
    return mantenimientos.filter((m) => m.año === selectedYear);
  }, [mantenimientos, selectedYear]);

  /**
   * Crear mapa de mantenimientos por elemento, MERGEANDO todas las programaciones
   * del mismo elemento/año.
   *
   * Si hay 5-6 programaciones para el mismo equipo, aquí se combinan todas las
   * semanas en un solo objeto sintético, para que el cronograma muestre TODAS
   * las celdas programadas de ese equipo.
   */
  const mantenimientosMap = useMemo(() => {
    const byElemento = new Map<number, MantenimientoProgramado[]>();
    for (const m of mantenimientosDelAno) {
      const list = byElemento.get(m.elemento_id) ?? [];
      list.push(m);
      byElemento.set(m.elemento_id, list);
    }

    // Todas las weekKeys a partir de MESES
    const weekKeys: string[] = [];
    MESES.forEach((mes) => {
      [1, 2, 3, 4].forEach((semana) => {
        weekKeys.push(`${mes.key}_semana${semana}`);
      });
    });

    const map = new Map<number, MantenimientoProgramado>();

    for (const [elementoId, registros] of byElemento) {
      if (registros.length === 0) continue;

      // Empezar con el primer registro como base
      const base = { ...registros[0] } as MantenimientoProgramado;

      // OR de todas las semanas marcadas en cualquiera de los registros
      for (const wk of weekKeys) {
        const key = wk as keyof MantenimientoProgramado;
        const isTrueInAny = registros.some(
          (r) => (r[key] as unknown as boolean) === true
        );
        (base as any)[key] = isTrueInAny;
      }

      // Merge de tipos_semana: las programaciones posteriores pueden sobreescribir el tipo
      let mergedTipos: Record<string, SemanaProgramada> = {};
      for (const r of registros) {
        const ts =
          (r.tipos_semana as Record<string, SemanaProgramada> | null) ?? {};
        mergedTipos = { ...mergedTipos, ...ts };
      }
      base.tipos_semana =
        Object.keys(mergedTipos).length > 0 ? mergedTipos : null;

      map.set(elementoId, base);
    }

    return map;
  }, [mantenimientosDelAno]);

  // Mapa: elemento_id → Set de weekKeys realizadas (ej: "enero_semana1") para el año seleccionado
  const realizadosWeekMap = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const r of realizados) {
      if (r.programacion_id == null) continue;
      const fecha =
        typeof r.fecha_mantenimiento === "string"
          ? new Date(r.fecha_mantenimiento)
          : r.fecha_mantenimiento;
      if (!(fecha instanceof Date) || Number.isNaN(fecha.getTime())) continue;
      if (fecha.getFullYear() !== selectedYear) continue;
      const weekKey = getWeekKeyFromDate(fecha);
      if (!map.has(r.elemento_id)) {
        map.set(r.elemento_id, new Set());
      }
      map.get(r.elemento_id)!.add(weekKey);
    }
    return map;
  }, [realizados, selectedYear]);

  // Obtener ubicación seleccionada
  const ubicacionSeleccionada = useMemo(() => {
    return ubicaciones.find((u) => u.id.toString() === selectedUbicacionId);
  }, [ubicaciones, selectedUbicacionId]);

  const handleElementoClick = (elemento: ElementoOption) => {
    const mantenimiento = mantenimientosMap.get(elemento.id);
    setSelectedElemento(elemento);
    setSelectedMantenimiento(mantenimiento || null);

    if (mantenimiento) {
      const semanas: Record<string, boolean> = {};
      MESES.forEach((mes) => {
        [1, 2, 3, 4].forEach((semana) => {
          const key = `${mes.key}_semana${semana}`;
          semanas[key] = mantenimiento[
            key as keyof MantenimientoProgramado
          ] as boolean;
        });
      });
      setFormSemanas(semanas);
      // Cargar tipos por semana del mantenimiento existente
      const tiposExistentesRaw =
        (mantenimiento.tipos_semana as Record<
          string,
          SemanaProgramada
        > | null) ?? null;
      const tiposSoloTipo: Record<
        string,
        "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO"
      > = {};
      if (tiposExistentesRaw) {
        for (const [key, value] of Object.entries(tiposExistentesRaw)) {
          if (
            value &&
            typeof value === "object" &&
            "tipo" in value &&
            value.tipo
          ) {
            tiposSoloTipo[key] = value.tipo;
          }
        }
      }
      setFormTiposSemana(tiposSoloTipo);
      setFormFrecuencia(mantenimiento.frecuencia);
      setFormObservaciones(mantenimiento.observaciones || "");
    } else {
      const semanas: Record<string, boolean> = {};
      MESES.forEach((mes) => {
        [1, 2, 3, 4].forEach((semana) => {
          semanas[`${mes.key}_semana${semana}`] = false;
        });
      });
      setFormSemanas(semanas);
      setFormTiposSemana({});
      setFormFrecuencia("TRIMESTRAL");
      setFormObservaciones("");
    }

    setIsDialogOpen(true);
  };

  const toggleSemana = (mesKey: string, semana: number) => {
    const key = `${mesKey}_semana${semana}`;
    const isCurrentlyMarked = formSemanas[key];

    if (isCurrentlyMarked) {
      // Si ya está marcada con el mismo tipo, desmarcar
      // Si está marcada con otro tipo, cambiar al tipo actual
      const currentTipo = formTiposSemana[key] || "PREVENTIVO";
      if (currentTipo === tipoPintura) {
        // Desmarcar
        setFormSemanas((prev) => ({ ...prev, [key]: false }));
        setFormTiposSemana((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      } else {
        // Cambiar tipo
        setFormTiposSemana((prev) => ({ ...prev, [key]: tipoPintura }));
      }
    } else {
      // Marcar con el tipo activo
      setFormSemanas((prev) => ({ ...prev, [key]: true }));
      setFormTiposSemana((prev) => ({ ...prev, [key]: tipoPintura }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedElemento) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("elemento_id", selectedElemento.id.toString());
      formData.append("año", selectedYear.toString());
      formData.append("frecuencia", formFrecuencia);
      formData.append("estado", selectedMantenimiento?.estado || "PENDIENTE");
      formData.append("observaciones", formObservaciones);
      formData.append("tipos_semana", JSON.stringify(formTiposSemana));

      Object.entries(formSemanas).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      try {
        if (onSetCronograma) {
          await toast.promise(onSetCronograma(formData), {
            loading: "Guardando cronograma...",
            success: "Cronograma actualizado",
            error: "Error al guardar cronograma",
          });
        } else if (selectedMantenimiento) {
          formData.append("id", selectedMantenimiento.id.toString());
          await toast.promise(onUpdateMantenimiento(formData), {
            loading: "Actualizando cronograma...",
            success: "Cronograma actualizado",
            error: "Error al actualizar",
          });
        } else {
          await toast.promise(onCreateMantenimiento(formData), {
            loading: "Creando cronograma...",
            success: "Cronograma creado",
            error: "Error al crear",
          });
        }
        setIsDialogOpen(false);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const handleDelete = async () => {
    if (!selectedMantenimiento) return;

    startTransition(async () => {
      try {
        await toast.promise(onDeleteMantenimiento(selectedMantenimiento.id), {
          loading: "Eliminando cronograma...",
          success: "Cronograma eliminado",
          error: "Error al eliminar",
        });
        setIsDialogOpen(false);
      } catch (error) {
        console.error(error);
      }
    });
  };

  /**
   * Colores separados por estado (80%) y tipo (20%).
   * - Estado: ejecutado/aplazado/cancelado/pendiente
   * - Tipo: preventivo/correctivo/predictivo
   */
  const getCellVisual = (
    mantenimiento: MantenimientoProgramado | undefined,
    mesKey: string,
    semana: number
  ): { estadoClass: string; tipoClass: string } => {
    if (!mantenimiento) return { estadoClass: "", tipoClass: "" };

    const weekKeyStr = `${mesKey}_semana${semana}`;
    const weekKey = weekKeyStr as keyof MantenimientoProgramado;
    const isMarked = mantenimiento[weekKey] as boolean;

    if (!isMarked) return { estadoClass: "", tipoClass: "" };

    // Estado principal de la celda (80%)
    let estadoClass = "";
    const semanasRealizadas = realizadosWeekMap.get(mantenimiento.elemento_id);
    const isEjecutado = semanasRealizadas?.has(weekKeyStr);

    if (isEjecutado) {
      estadoClass = "bg-cyan-400"; // Ejecutado
    } else {
      switch (mantenimiento.estado) {
        case "APLAZADO":
          estadoClass = "bg-red-400";
          break;
        case "CANCELADO":
          estadoClass = "bg-gray-400";
          break;
        default:
          // Pendiente / Programado
          estadoClass = "bg-yellow-300";
          break;
      }
    }

    // Banda pequeña para el tipo (20%)
    const tiposSemana =
      (mantenimiento.tipos_semana as Record<string, SemanaProgramada> | null) ??
      {};
    const tipo = tiposSemana[weekKeyStr]?.tipo ?? "PREVENTIVO";

    let tipoClass = "";
    switch (tipo) {
      case "CORRECTIVO":
        tipoClass = "bg-orange-600";
        break;
      case "PREDICTIVO":
        tipoClass = "bg-purple-600";
        break;
      default:
        tipoClass = "bg-blue-600"; // PREVENTIVO
        break;
    }

    return { estadoClass, tipoClass };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="h-8 w-8 text-primary" />
          Cronograma de Mantenimientos
        </h1>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 min-w-[200px]">
              <Label>Sede</Label>
              <Select
                value={selectedSedeId}
                onValueChange={(v) => {
                  setSelectedSedeId(v);
                  setSelectedUbicacionId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sede" />
                </SelectTrigger>
                <SelectContent>
                  {sedes.map((sede) => (
                    <SelectItem key={sede.id} value={sede.id.toString()}>
                      {sede.nombre} - {sede.ciudad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 min-w-[200px]">
              <Label>Ubicación</Label>
              <Select
                value={selectedUbicacionId}
                onValueChange={setSelectedUbicacionId}
                disabled={!selectedSedeId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedSedeId
                        ? "Selecciona ubicación"
                        : "Primero selecciona sede"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredUbicaciones.map((ubicacion) => (
                    <SelectItem
                      key={ubicacion.id}
                      value={ubicacion.id.toString()}
                    >
                      {ubicacion.codigo} - {ubicacion.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Año</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedYear((y) => y - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="w-16 text-center font-bold text-lg">
                  {selectedYear}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedYear((y) => y + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Leyenda */}
            <div className="ml-auto flex flex-col gap-1.5 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold">Estado (80% de la celda):</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-cyan-400 border border-cyan-500 rounded-sm" />
                  <span>Ejecutado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-red-400 border border-red-500 rounded-sm" />
                  <span>Aplazado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded-sm" />
                  <span>Cancelado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-yellow-300 border border-yellow-400 rounded-sm" />
                  <span>Pendiente / Programado</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold">
                  Tipo (franja superior 20%):
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-2 bg-blue-600 border border-blue-700 rounded-sm" />
                  <span>Preventivo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-2 bg-orange-600 border border-orange-700 rounded-sm" />
                  <span>Correctivo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-2 bg-purple-600 border border-purple-700 rounded-sm" />
                  <span>Predictivo</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cronograma estilo Excel */}
      {selectedUbicacionId ? (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 bg-green-500 dark:bg-green-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-bold">AÑO:</span>
                <span className="font-bold text-xl">{selectedYear}</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-white/90 dark:bg-white/80 text-black"
              >
                {filteredElementos.length} elementos
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {filteredElementos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay elementos en esta ubicación</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-xs">
                <thead>
                  {/* Primera fila: Headers principales y meses */}
                  <tr className="bg-amber-100 dark:bg-amber-900/50 text-foreground">
                    <th
                      rowSpan={2}
                      className="border border-border dark:border-border/50 p-1 font-bold text-center w-8 bg-green-400 dark:bg-green-600 text-black dark:text-white"
                    >
                      <div
                        className="writing-mode-vertical transform -rotate-180"
                        style={{ writingMode: "vertical-rl" }}
                      >
                        ÁREA
                      </div>
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-border dark:border-border/50 p-1 font-bold text-center min-w-[120px] bg-amber-100 dark:bg-amber-900/50"
                    >
                      ELEMENTO DE LA
                      <br />
                      INFRAESTRUCTURA O<br />
                      RECURSO DIDÁCTICO
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-border dark:border-border/50 p-1 font-bold text-center min-w-[100px] bg-amber-100 dark:bg-amber-900/50"
                    >
                      CÓDIGO
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-border dark:border-border/50 p-1 font-bold text-center w-20 bg-amber-100 dark:bg-amber-900/50"
                    >
                      FRECUENCIA
                    </th>
                    {MESES.map((mes) => (
                      <th
                        key={mes.key}
                        colSpan={4}
                        className="border border-border dark:border-border/50 p-1 font-bold text-center bg-amber-100 dark:bg-amber-900/50"
                      >
                        {mes.short}
                      </th>
                    ))}
                    <th
                      rowSpan={2}
                      className="border border-border dark:border-border/50 p-1 font-bold text-center min-w-[150px] bg-amber-100 dark:bg-amber-900/50"
                    >
                      OBSERVACIONES
                    </th>
                  </tr>
                  {/* Segunda fila: Semanas */}
                  <tr className="bg-amber-100 dark:bg-amber-900/50 text-foreground">
                    {MESES.map((mes) =>
                      [1, 2, 3, 4].map((semana) => (
                        <th
                          key={`${mes.key}-${semana}`}
                          className="border border-border dark:border-border/50 p-0.5 font-bold text-center w-5 bg-amber-100 dark:bg-amber-900/50"
                        >
                          {semana}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredElementos.map((elemento, index) => {
                    const mantenimiento = mantenimientosMap.get(elemento.id);

                    return (
                      <tr
                        key={elemento.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleElementoClick(elemento)}
                      >
                        {/* Área - solo en primera fila con rowSpan */}
                        {index === 0 && (
                          <td
                            rowSpan={filteredElementos.length}
                            className="border border-border dark:border-border/50 p-1 bg-amber-100 dark:bg-amber-900/50 font-bold text-center align-middle text-foreground"
                            style={{
                              writingMode: "vertical-rl",
                              transform: "rotate(180deg)",
                            }}
                          >
                            {ubicacionSeleccionada?.nombre.toUpperCase()}
                          </td>
                        )}
                        {/* Tipo de elemento */}
                        <td className="border border-border dark:border-border/50 p-1 bg-amber-50 dark:bg-amber-950/30 font-medium text-foreground">
                          {elemento.marca?.toUpperCase() || "EQUIPO"}
                        </td>
                        {/* Código */}
                        <td className="border border-border dark:border-border/50 p-1 bg-amber-50 dark:bg-amber-950/30 text-foreground">
                          {elemento.serie}
                        </td>
                        {/* Frecuencia */}
                        <td
                          className="border border-border dark:border-border/50 p-1 text-center bg-amber-50 dark:bg-amber-950/30 text-foreground"
                          style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                          }}
                        >
                          {mantenimiento?.frecuencia || "-"}
                        </td>
                        {/* Celdas de semanas */}
                        {MESES.map((mes) =>
                          [1, 2, 3, 4].map((semana) => {
                            const { estadoClass, tipoClass } = getCellVisual(
                              mantenimiento,
                              mes.key,
                              semana
                            );
                            const hasEstado = Boolean(estadoClass);
                            return (
                              <td
                                key={`${mes.key}-${semana}`}
                                className={`border border-border dark:border-border/50 p-0 w-5 h-6 ${
                                  hasEstado ? estadoClass : "bg-background"
                                }`}
                              >
                                {hasEstado && (
                                  <div className="flex flex-col h-full w-full">
                                    {/* Banda de tipo (20% superior) */}
                                    <div
                                      className={`h-[20%] w-full ${tipoClass}`}
                                    />
                                    {/* Resto celda (80%) ya tiene color de estado en el td */}
                                    <div className="flex-1" />
                                  </div>
                                )}
                              </td>
                            );
                          })
                        )}
                        {/* Observaciones */}
                        <td className="border border-border dark:border-border/50 p-1 text-xs bg-background text-foreground">
                          {mantenimiento?.observaciones || ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">
                Selecciona una sede y ubicación
              </p>
              <p className="text-sm">
                para ver el cronograma de mantenimientos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para configurar cronograma */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configurar Cronograma - {selectedYear}
            </DialogTitle>
            <DialogDescription>
              {selectedElemento && (
                <span className="font-medium">
                  {selectedElemento.serie}{" "}
                  {selectedElemento.marca && `- ${selectedElemento.marca}`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Frecuencia y Tipo de pintura */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Frecuencia</Label>
                <Select
                  value={formFrecuencia}
                  onValueChange={setFormFrecuencia}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FRECUENCIAS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tipo al marcar semanas</Label>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      tipoPintura === "PREVENTIVO" ? "default" : "outline"
                    }
                    className={
                      tipoPintura === "PREVENTIVO"
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : ""
                    }
                    onClick={() => setTipoPintura("PREVENTIVO")}
                  >
                    Preventivo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      tipoPintura === "CORRECTIVO" ? "default" : "outline"
                    }
                    className={
                      tipoPintura === "CORRECTIVO"
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : ""
                    }
                    onClick={() => setTipoPintura("CORRECTIVO")}
                  >
                    Correctivo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      tipoPintura === "PREDICTIVO" ? "default" : "outline"
                    }
                    className={
                      tipoPintura === "PREDICTIVO"
                        ? "bg-purple-500 hover:bg-purple-600 text-white"
                        : ""
                    }
                    onClick={() => setTipoPintura("PREDICTIVO")}
                  >
                    Predictivo
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground pb-1">
                Selecciona el tipo y luego haz clic en las semanas. Clic de
                nuevo para cambiar tipo o desmarcar.
              </p>
            </div>

            {/* Grid de meses y semanas estilo Excel */}
            <div className="border border-border rounded overflow-hidden">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-amber-200 dark:bg-amber-800">
                    <th className="border border-border p-2 font-bold text-foreground">
                      MES
                    </th>
                    <th className="border border-border p-2 font-bold text-center w-20 text-foreground">
                      SEM 1
                    </th>
                    <th className="border border-border p-2 font-bold text-center w-20 text-foreground">
                      SEM 2
                    </th>
                    <th className="border border-border p-2 font-bold text-center w-20 text-foreground">
                      SEM 3
                    </th>
                    <th className="border border-border p-2 font-bold text-center w-20 text-foreground">
                      SEM 4
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MESES.map((mes, i) => (
                    <tr
                      key={mes.key}
                      className={i % 2 === 0 ? "bg-background" : "bg-muted/30"}
                    >
                      <td className="border border-border p-2 font-medium bg-amber-200 dark:bg-amber-800 text-foreground">
                        {mes.nombre}
                      </td>
                      {[1, 2, 3, 4].map((semana) => {
                        const key = `${mes.key}_semana${semana}`;
                        const isChecked = formSemanas[key] || false;
                        const tipoSemana = formTiposSemana[key] || "PREVENTIVO";

                        // Color según tipo
                        let cellBg = "hover:bg-gray-100 dark:hover:bg-gray-800";
                        if (isChecked) {
                          switch (tipoSemana) {
                            case "CORRECTIVO":
                              cellBg =
                                "bg-orange-400 dark:bg-orange-500 text-white";
                              break;
                            case "PREDICTIVO":
                              cellBg =
                                "bg-purple-400 dark:bg-purple-500 text-white";
                              break;
                            default:
                              cellBg =
                                "bg-blue-400 dark:bg-blue-500 text-white";
                          }
                        }

                        return (
                          <td
                            key={semana}
                            className={`border border-border p-2 text-center cursor-pointer transition-colors ${cellBg}`}
                            onClick={() => toggleSemana(mes.key, semana)}
                          >
                            {isChecked && <Check className="h-5 w-5 mx-auto" />}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                value={formObservaciones}
                onChange={(e) => setFormObservaciones(e.target.value)}
                placeholder="Ej: 18/03/2025 Se reprograma mantenimiento preventivo para el próximo período"
                rows={2}
              />
            </div>

            {/* Cambio rápido de estado - solo si existe el mantenimiento */}
            {selectedMantenimiento &&
              (onMarcarSemanaRealizada || onCambiarEstado) && (
                <div className="space-y-2">
                  <Label>
                    Estado actual:{" "}
                    <Badge
                      className={
                        selectedMantenimiento.estado === "REALIZADO"
                          ? "bg-cyan-500"
                          : selectedMantenimiento.estado === "APLAZADO"
                          ? "bg-red-500"
                          : selectedMantenimiento.estado === "CANCELADO"
                          ? "bg-gray-500"
                          : "bg-yellow-500"
                      }
                    >
                      {selectedMantenimiento.estado === "REALIZADO"
                        ? "EJECUTADO"
                        : selectedMantenimiento.estado}
                    </Badge>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMantenimiento.estado !== "REALIZADO" &&
                      (onMarcarSemanaRealizada ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-cyan-600 border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950"
                          disabled={isPending}
                          onClick={() => {
                            setProgramacionParaMarcar(selectedMantenimiento);
                            setIsDialogOpen(false);
                          }}
                        >
                          <Check className="h-4 w-4" />
                          Marcar semana como ejecutada
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-cyan-600 border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950"
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await toast.promise(
                                onCambiarEstado!(
                                  selectedMantenimiento.id,
                                  "REALIZADO"
                                ),
                                {
                                  loading: "Cambiando estado...",
                                  success: "Marcado como ejecutado",
                                  error: "Error al cambiar estado",
                                }
                              );
                              setIsDialogOpen(false);
                            });
                          }}
                        >
                          <Check className="h-4 w-4" />
                          Marcar Ejecutado
                        </Button>
                      ))}
                    {selectedMantenimiento.estado !== "APLAZADO" &&
                      onCambiarEstado && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await toast.promise(
                                onCambiarEstado(
                                  selectedMantenimiento.id,
                                  "APLAZADO"
                                ),
                                {
                                  loading: "Cambiando estado...",
                                  success: "Marcado como aplazado",
                                  error: "Error al cambiar estado",
                                }
                              );
                              setIsDialogOpen(false);
                            });
                          }}
                        >
                          <Clock className="h-4 w-4" />
                          Aplazar
                        </Button>
                      )}
                    {selectedMantenimiento.estado !== "PENDIENTE" &&
                      onCambiarEstado && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-yellow-600 border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await toast.promise(
                                onCambiarEstado(
                                  selectedMantenimiento.id,
                                  "PENDIENTE"
                                ),
                                {
                                  loading: "Cambiando estado...",
                                  success: "Restaurado a pendiente",
                                  error: "Error al cambiar estado",
                                }
                              );
                              setIsDialogOpen(false);
                            });
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restaurar Pendiente
                        </Button>
                      )}
                    {selectedMantenimiento.estado !== "CANCELADO" &&
                      onCambiarEstado && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-gray-600 border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900"
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await toast.promise(
                                onCambiarEstado(
                                  selectedMantenimiento.id,
                                  "CANCELADO"
                                ),
                                {
                                  loading: "Cambiando estado...",
                                  success: "Cancelado",
                                  error: "Error al cambiar estado",
                                }
                              );
                              setIsDialogOpen(false);
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      )}
                  </div>
                </div>
              )}
          </div>

          <DialogFooter className="gap-2 mt-6">
            {selectedMantenimiento && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Eliminar
              </Button>
            )}
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="bg-[#92D050] hover:bg-[#7BC043] text-black"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {selectedMantenimiento ? "Guardar Cambios" : "Crear Cronograma"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {programacionParaMarcar && onMarcarSemanaRealizada && (
        <MarcarSemanaRealizadaDialog
          programacion={programacionParaMarcar}
          realizadosDeEstaProgramacion={realizados.filter(
            (r) => r.programacion_id === programacionParaMarcar.id
          )}
          onConfirm={(weekKey) =>
            onMarcarSemanaRealizada(programacionParaMarcar.id, weekKey)
          }
          onClose={() => setProgramacionParaMarcar(null)}
        />
      )}
    </div>
  );
}
