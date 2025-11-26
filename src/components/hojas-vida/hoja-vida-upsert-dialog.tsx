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
import { Switch } from "../ui/switch";
import type { HojaVida } from "../../modules/hojas_vida/types";
import type { Elemento } from "../../modules/elementos/types";

const schema = z.object({
  elemento_id: z.string().min(1, "Selecciona elemento"),
  fecha_dilegenciamiento: z.string().min(1, "Fecha requerida"),
  tipo_elemento: z.enum(["EQUIPO", "RECURSO_DIDACTICO"]),
  area_ubicacion: z.string().optional(),
  responsable: z.string().optional(),
  descripcion: z.string().optional(),
  requerimientos_funcionamiento: z.string().optional(),
  requerimientos_seguridad: z.string().optional(),
  rutina_mantenimiento: z.enum(["DIARIO", "SEMANAL", "MENSUAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"]).optional().or(z.literal("")),
  fecha_actualizacion: z.string().optional(),
  activo: z.boolean().default(true),
});

type HojaVidaFormData = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<HojaVida>;
  elementos: Elemento[];
  hiddenFields?: Record<string, string | number>;
  onClose?: () => void;
};

export function HojaVidaUpsertDialog({
  serverAction,
  create = true,
  defaultValues,
  elementos,
  hiddenFields,
  onClose,
}: Props) {
  const [open, setOpen] = useState(!defaultValues);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HojaVidaFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      elemento_id: defaultValues?.elemento_id?.toString() || "",
      fecha_dilegenciamiento: defaultValues?.fecha_dilegenciamiento
        ? new Date(defaultValues.fecha_dilegenciamiento).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      tipo_elemento: defaultValues?.tipo_elemento || "EQUIPO",
      area_ubicacion: defaultValues?.area_ubicacion || "",
      responsable: defaultValues?.responsable || "",
      descripcion: defaultValues?.descripcion || "",
      requerimientos_funcionamiento: defaultValues?.requerimientos_funcionamiento || "",
      requerimientos_seguridad: defaultValues?.requerimientos_seguridad || "",
      rutina_mantenimiento: defaultValues?.rutina_mantenimiento || "",
      fecha_actualizacion: defaultValues?.fecha_actualizacion
        ? new Date(defaultValues.fecha_actualizacion).toISOString().split("T")[0]
        : "",
      activo: defaultValues?.activo ?? true,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        elemento_id: defaultValues.elemento_id?.toString() || "",
        fecha_dilegenciamiento: defaultValues.fecha_dilegenciamiento
          ? new Date(defaultValues.fecha_dilegenciamiento).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        tipo_elemento: defaultValues.tipo_elemento || "EQUIPO",
        area_ubicacion: defaultValues.area_ubicacion || "",
        responsable: defaultValues.responsable || "",
        descripcion: defaultValues.descripcion || "",
        requerimientos_funcionamiento: defaultValues.requerimientos_funcionamiento || "",
        requerimientos_seguridad: defaultValues.requerimientos_seguridad || "",
        rutina_mantenimiento: defaultValues.rutina_mantenimiento || "",
        fecha_actualizacion: defaultValues.fecha_actualizacion
          ? new Date(defaultValues.fecha_actualizacion).toISOString().split("T")[0]
          : "",
        activo: defaultValues.activo ?? true,
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: HojaVidaFormData) => {
    try {
      const formData = new FormData();

      formData.append("elemento_id", data.elemento_id);
      formData.append("fecha_dilegenciamiento", data.fecha_dilegenciamiento);
      formData.append("tipo_elemento", data.tipo_elemento);
      if (data.area_ubicacion) formData.append("area_ubicacion", data.area_ubicacion);
      if (data.responsable) formData.append("responsable", data.responsable);
      if (data.descripcion) formData.append("descripcion", data.descripcion);
      if (data.requerimientos_funcionamiento) formData.append("requerimientos_funcionamiento", data.requerimientos_funcionamiento);
      if (data.requerimientos_seguridad) formData.append("requerimientos_seguridad", data.requerimientos_seguridad);
      if (data.rutina_mantenimiento) formData.append("rutina_mantenimiento", data.rutina_mantenimiento);
      if (data.fecha_actualizacion) formData.append("fecha_actualizacion", data.fecha_actualizacion);
      formData.append("activo", String(data.activo));

      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando hoja de vida..." : "Actualizando hoja de vida...",
        success: create
          ? "Hoja de vida creada exitosamente"
          : "Hoja de vida actualizada exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setOpen(false);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear Hoja de Vida" : "Editar Hoja de Vida";
  const submitText = create ? "Crear" : "Guardar cambios";

  return (
    <>
      {create && (
        <Button onClick={() => setOpen(true)}>{btnText}</Button>
      )}
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen && onClose) onClose();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Elemento */}
            <div className="grid gap-1">
              <Label htmlFor="elemento_id">Elemento</Label>
              <Select
                value={watch("elemento_id")}
                onValueChange={(value) => setValue("elemento_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona elemento" />
                </SelectTrigger>
                <SelectContent>
                  {elementos.map((e) => (
                    <SelectItem key={e.id} value={e.id.toString()}>
                      {e.serie} - {e.marca || ""} {e.modelo || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.elemento_id && (
                <p className="text-red-500 text-sm">{errors.elemento_id.message}</p>
              )}
            </div>

            {/* Fecha Diligenciamiento y Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="fecha_dilegenciamiento">Fecha Diligenciamiento</Label>
                <Input
                  id="fecha_dilegenciamiento"
                  type="date"
                  {...register("fecha_dilegenciamiento")}
                />
                {errors.fecha_dilegenciamiento && (
                  <p className="text-red-500 text-sm">{errors.fecha_dilegenciamiento.message}</p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="tipo_elemento">Tipo de Elemento</Label>
                <Select
                  value={watch("tipo_elemento")}
                  onValueChange={(value) => setValue("tipo_elemento", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EQUIPO">Equipo</SelectItem>
                    <SelectItem value="RECURSO_DIDACTICO">Recurso Didáctico</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_elemento && (
                  <p className="text-red-500 text-sm">{errors.tipo_elemento.message}</p>
                )}
              </div>
            </div>

            {/* Área Ubicación y Responsable */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="area_ubicacion">Área de Ubicación</Label>
                <Input
                  id="area_ubicacion"
                  type="text"
                  placeholder="Área donde se ubica el elemento"
                  {...register("area_ubicacion")}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="responsable">Responsable</Label>
                <Input
                  id="responsable"
                  type="text"
                  placeholder="Nombre del responsable"
                  {...register("responsable")}
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="grid gap-1">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción del elemento..."
                {...register("descripcion")}
                rows={3}
              />
            </div>

            {/* Requerimientos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="requerimientos_funcionamiento">Requerimientos de Funcionamiento</Label>
                <Textarea
                  id="requerimientos_funcionamiento"
                  placeholder="Requerimientos para el funcionamiento..."
                  {...register("requerimientos_funcionamiento")}
                  rows={3}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="requerimientos_seguridad">Requerimientos de Seguridad</Label>
                <Textarea
                  id="requerimientos_seguridad"
                  placeholder="Requerimientos de seguridad..."
                  {...register("requerimientos_seguridad")}
                  rows={3}
                />
              </div>
            </div>

            {/* Rutina Mantenimiento y Fecha Actualización */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="rutina_mantenimiento">Rutina de Mantenimiento</Label>
                <Select
                  value={watch("rutina_mantenimiento") || ""}
                  onValueChange={(value) => setValue("rutina_mantenimiento", value || "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin rutina</SelectItem>
                    <SelectItem value="DIARIO">Diario</SelectItem>
                    <SelectItem value="SEMANAL">Semanal</SelectItem>
                    <SelectItem value="MENSUAL">Mensual</SelectItem>
                    <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                    <SelectItem value="SEMESTRAL">Semestral</SelectItem>
                    <SelectItem value="ANUAL">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="fecha_actualizacion">Fecha de Actualización</Label>
                <Input
                  id="fecha_actualizacion"
                  type="date"
                  {...register("fecha_actualizacion")}
                />
              </div>
            </div>

            {/* Activo */}
            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={watch("activo")}
                onCheckedChange={(checked) => setValue("activo", checked)}
              />
              <Label htmlFor="activo" className="cursor-pointer">
                Activo
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  if (onClose) onClose();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {submitText}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

