"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ElementoSearchSelect } from "../ui/elemento-search-select";
import { GenericDatePicker } from "../ui/generic-date-picker";
import type { MantenimientoProgramado } from "../../modules/mantenimientos/types";

type SedeOption = { id: number; nombre: string; ciudad: string; municipio: string | null };
type UbicacionOption = { id: number; codigo: string; nombre: string; sede_id: number };
type CategoriaOption = { id: number; nombre: string };
type SubcategoriaOption = { id: number; nombre: string; categoria_id: number };
type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  categoria_id: number;
  subcategoria_id: number | null;
  ubicacion_id: number | null;
  ubicacion_rel?: {
    id: number;
    nombre: string;
    sede?: { id: number; nombre: string; ciudad: string; municipio: string | null } | null;
  } | null;
};

const schema = z.object({
  sede_id: z.string().min(1, "Selecciona sede"),
  ubicacion_id: z.string().min(1, "Selecciona ubicación"),
  categoria_id: z.string().min(1, "Selecciona categoría"),
  subcategoria_id: z.string().optional(),
  elemento_id: z.string().min(1, "Selecciona elemento"),
  fecha_mantenimiento: z.string().min(1, "Fecha requerida"),
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO", "PREDICTIVO"]),
  descripcion: z.string().min(1, "Descripción requerida"),
  responsable: z.string().optional().or(z.literal("")),
  costo: z.string().optional(),
  estado: z.enum(["PENDIENTE", "REALIZADO", "APLAZADO", "CANCELADO"]),
  observaciones: z.string().optional(),
});

type ProgramadoFormValues = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: globalThis.FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<MantenimientoProgramado>;
  elementos: ElementoOption[];
  sedes: SedeOption[];
  ubicaciones: UbicacionOption[];
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  hiddenFields?: Record<string, string | number>;
  onClose?: () => void;
};

function formatDateForInput(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}

export function MantenimientoProgramadoUpsertDialog({
  serverAction,
  create = true,
  defaultValues,
  elementos,
  sedes,
  ubicaciones,
  categorias,
  subcategorias,
  hiddenFields,
  onClose,
}: Props) {
  const [open, setOpen] = useState(false);
  const elementoSeleccionado = defaultValues?.elemento_id
    ? elementos.find((e) => e.id === defaultValues.elemento_id)
    : null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProgramadoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sede_id: elementoSeleccionado?.ubicacion_rel?.sede?.id?.toString() || "",
      ubicacion_id: elementoSeleccionado?.ubicacion_id?.toString() || "",
      categoria_id: elementoSeleccionado?.categoria_id?.toString() || "",
      subcategoria_id: elementoSeleccionado?.subcategoria_id?.toString() || "",
      elemento_id: defaultValues?.elemento_id?.toString() || "",
      fecha_mantenimiento: defaultValues?.fecha_mantenimiento
        ? formatDateForInput(defaultValues.fecha_mantenimiento)
        : formatDateForInput(new Date()),
      tipo: defaultValues?.tipo || "PREVENTIVO",
      descripcion: defaultValues?.descripcion || "",
      responsable: defaultValues?.responsable || "",
      costo: defaultValues?.costo != null ? String(defaultValues.costo) : "",
      estado: defaultValues?.estado || "PENDIENTE",
      observaciones: defaultValues?.observaciones || "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      const elemento = elementos.find((e) => e.id === defaultValues.elemento_id);
      reset({
        sede_id: elemento?.ubicacion_rel?.sede?.id?.toString() || "",
        ubicacion_id: elemento?.ubicacion_id?.toString() || "",
        categoria_id: elemento?.categoria_id?.toString() || "",
        subcategoria_id: elemento?.subcategoria_id?.toString() || "",
        elemento_id: defaultValues.elemento_id?.toString() || "",
        fecha_mantenimiento: defaultValues.fecha_mantenimiento
          ? formatDateForInput(defaultValues.fecha_mantenimiento)
          : formatDateForInput(new Date()),
        tipo: defaultValues.tipo || "PREVENTIVO",
        descripcion: defaultValues.descripcion || "",
        responsable: defaultValues.responsable || "",
        costo: defaultValues.costo != null ? String(defaultValues.costo) : "",
        estado: defaultValues.estado || "PENDIENTE",
        observaciones: defaultValues.observaciones || "",
      });
    }
  }, [defaultValues, reset, elementos]);

  useEffect(() => {
    if (!create && defaultValues) setOpen(true);
  }, [create, defaultValues]);

  const selectedSedeId = watch("sede_id");
  const filteredUbicaciones = ubicaciones.filter((u) => u.sede_id === parseInt(selectedSedeId || "0"));
  const selectedCategoriaId = watch("categoria_id");
  const filteredSubcategorias = subcategorias.filter((sub) => sub.categoria_id === parseInt(selectedCategoriaId || "0"));
  const selectedUbicacionId = watch("ubicacion_id");
  const selectedSubcategoriaId = watch("subcategoria_id");

  const filteredElementos = elementos.filter((elemento) => {
    const matchUbicacion = !selectedUbicacionId || elemento.ubicacion_id === parseInt(selectedUbicacionId);
    const matchCategoria = !selectedCategoriaId || elemento.categoria_id === parseInt(selectedCategoriaId);
    const matchSubcategoria = !selectedSubcategoriaId || elemento.subcategoria_id === parseInt(selectedSubcategoriaId);
    return matchUbicacion && matchCategoria && matchSubcategoria;
  });

  const onSubmit = async (data: ProgramadoFormValues) => {
    try {
      const formData = new FormData();
      formData.append("elemento_id", data.elemento_id);
      formData.append("fecha_mantenimiento", data.fecha_mantenimiento);
      formData.append("tipo", data.tipo);
      formData.append("descripcion", data.descripcion);
      formData.append("responsable", data.responsable || "");
      formData.append("costo", data.costo || "");
      formData.append("estado", data.estado);
      formData.append("observaciones", data.observaciones || "");

      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      await toast.promise(serverAction(formData), {
        loading: create ? "Creando..." : "Actualizando...",
        success: create ? "Mantenimiento programado creado" : "Mantenimiento programado actualizado",
        error: "Error al procesar",
      });

      reset();
      setOpen(false);
      onClose?.();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      {create && (
        <Button onClick={() => setOpen(true)}>Crear</Button>
      )}
      <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) onClose?.(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{create ? "Crear Mantenimiento Programado" : "Editar Mantenimiento Programado"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1">
              <Label>Sede</Label>
              <Select
                value={watch("sede_id")}
                onValueChange={(v) => {
                  setValue("sede_id", v);
                  setValue("ubicacion_id", "");
                  setValue("categoria_id", "");
                  setValue("subcategoria_id", "");
                  setValue("elemento_id", "");
                }}
                disabled={sedes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={sedes.length === 0 ? "No hay sedes" : "Selecciona sede"} />
                </SelectTrigger>
                <SelectContent>
                  {sedes.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.nombre} - {s.ciudad}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sede_id && <p className="text-red-500 text-sm">{errors.sede_id.message}</p>}
            </div>

            <div className="grid gap-1">
              <Label>Ubicación</Label>
              <Select
                value={watch("ubicacion_id") || undefined}
                onValueChange={(v) => {
                  setValue("ubicacion_id", v || "");
                  setValue("categoria_id", "");
                  setValue("subcategoria_id", "");
                  setValue("elemento_id", "");
                }}
                disabled={!selectedSedeId || filteredUbicaciones.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!selectedSedeId ? "Selecciona sede primero" : "Selecciona ubicación"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredUbicaciones.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>{u.codigo} - {u.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ubicacion_id && <p className="text-red-500 text-sm">{errors.ubicacion_id.message}</p>}
            </div>

            <div className="grid gap-1">
              <Label>Categoría</Label>
              <Select
                value={watch("categoria_id")}
                onValueChange={(v) => { setValue("categoria_id", v); setValue("subcategoria_id", ""); setValue("elemento_id", ""); }}
                disabled={categorias.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categorias.length === 0 ? "No hay categorías" : "Selecciona categoría"} />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria_id && <p className="text-red-500 text-sm">{errors.categoria_id.message}</p>}
            </div>

            <div className="grid gap-1">
              <Label>Subcategoría</Label>
              <Select
                value={watch("subcategoria_id") || undefined}
                onValueChange={(v) => { setValue("subcategoria_id", v || ""); setValue("elemento_id", ""); }}
                disabled={!selectedCategoriaId || filteredSubcategorias.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategorias.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ElementoSearchSelect
              elementos={filteredElementos}
              value={watch("elemento_id") || undefined}
              onValueChange={(v) => setValue("elemento_id", v)}
              label="Elemento"
              placeholder="Buscar elemento..."
              disabled={!selectedUbicacionId || !selectedCategoriaId}
              error={errors.elemento_id?.message}
            />

            <div className="grid gap-1">
              <GenericDatePicker
                label="Fecha planificada"
                value={watch("fecha_mantenimiento") ? new Date(watch("fecha_mantenimiento")) : undefined}
                onChange={(d) => setValue("fecha_mantenimiento", d ? formatDateForInput(d) : "")}
                placeholder="Selecciona fecha"
                error={errors.fecha_mantenimiento?.message}
              />
            </div>

            <div className="grid gap-1">
              <Label>Tipo</Label>
              <Select value={watch("tipo")} onValueChange={(v) => setValue("tipo", v as "PREVENTIVO" | "CORRECTIVO" | "PREDICTIVO")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
                  <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
                  <SelectItem value="PREDICTIVO">Predictivo</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-red-500 text-sm">{errors.tipo.message}</p>}
            </div>

            <div className="grid gap-1">
              <Label>Descripción</Label>
              <Textarea {...register("descripcion")} placeholder="Descripción del mantenimiento..." rows={3} />
              {errors.descripcion && <p className="text-red-500 text-sm">{errors.descripcion.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label>Responsable</Label>
                <Input {...register("responsable")} placeholder="Responsable" />
              </div>
              <div className="grid gap-1">
                <Label>Costo</Label>
                <Input {...register("costo")} type="number" min={0} step="0.01" placeholder="0" />
              </div>
            </div>

            <div className="grid gap-1">
              <Label>Estado</Label>
              <Select value={watch("estado")} onValueChange={(v) => setValue("estado", v as "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="REALIZADO">Ejecutado</SelectItem>
                  <SelectItem value="APLAZADO">Aplazado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              {errors.estado && <p className="text-red-500 text-sm">{errors.estado.message}</p>}
            </div>

            <div className="grid gap-1">
              <Label>Observaciones</Label>
              <Textarea {...register("observaciones")} placeholder="Observaciones..." rows={2} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); onClose?.(); }}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{create ? "Crear" : "Guardar cambios"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
