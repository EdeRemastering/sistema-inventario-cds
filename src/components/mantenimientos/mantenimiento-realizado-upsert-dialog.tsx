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
import type { MantenimientoRealizado } from "../../modules/mantenimientos/types";
import type { Elemento } from "../../modules/elementos/types";

const schema = z.object({
  elemento_id: z.string().min(1, "Selecciona elemento"),
  programacion_id: z.string().optional(),
  fecha_mantenimiento: z.string().min(1, "Fecha requerida"),
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO", "PREDICTIVO"]),
  descripcion: z.string().min(1, "Descripción requerida"),
  averias_encontradas: z.string().optional(),
  repuestos_utilizados: z.string().optional(),
  responsable: z.string().min(1, "Responsable requerido"),
  costo: z.string().optional(),
  creado_por: z.string().optional(),
});

type MantenimientoRealizadoFormData = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<MantenimientoRealizado>;
  elementos: Elemento[];
  hiddenFields?: Record<string, string | number>;
  onClose?: () => void;
};

export function MantenimientoRealizadoUpsertDialog({
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
  } = useForm<MantenimientoRealizadoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      elemento_id: defaultValues?.elemento_id?.toString() || "",
      programacion_id: defaultValues?.programacion_id?.toString() || "",
      fecha_mantenimiento: defaultValues?.fecha_mantenimiento
        ? new Date(defaultValues.fecha_mantenimiento).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      tipo: defaultValues?.tipo || "PREVENTIVO",
      descripcion: defaultValues?.descripcion || "",
      averias_encontradas: defaultValues?.averias_encontradas || "",
      repuestos_utilizados: defaultValues?.repuestos_utilizados || "",
      responsable: defaultValues?.responsable || "",
      costo: defaultValues?.costo?.toString() || "",
      creado_por: defaultValues?.creado_por || "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        elemento_id: defaultValues.elemento_id?.toString() || "",
        programacion_id: defaultValues.programacion_id?.toString() || "",
        fecha_mantenimiento: defaultValues.fecha_mantenimiento
          ? new Date(defaultValues.fecha_mantenimiento).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        tipo: defaultValues.tipo || "PREVENTIVO",
        descripcion: defaultValues.descripcion || "",
        averias_encontradas: defaultValues.averias_encontradas || "",
        repuestos_utilizados: defaultValues.repuestos_utilizados || "",
        responsable: defaultValues.responsable || "",
        costo: defaultValues.costo?.toString() || "",
        creado_por: defaultValues.creado_por || "",
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: MantenimientoRealizadoFormData) => {
    try {
      const formData = new FormData();

      formData.append("elemento_id", data.elemento_id);
      if (data.programacion_id) formData.append("programacion_id", data.programacion_id);
      formData.append("fecha_mantenimiento", data.fecha_mantenimiento);
      formData.append("tipo", data.tipo);
      formData.append("descripcion", data.descripcion);
      if (data.averias_encontradas) formData.append("averias_encontradas", data.averias_encontradas);
      if (data.repuestos_utilizados) formData.append("repuestos_utilizados", data.repuestos_utilizados);
      formData.append("responsable", data.responsable);
      if (data.costo) formData.append("costo", data.costo);
      if (data.creado_por) formData.append("creado_por", data.creado_por);

      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando mantenimiento..." : "Actualizando mantenimiento...",
        success: create
          ? "Mantenimiento realizado creado exitosamente"
          : "Mantenimiento realizado actualizado exitosamente",
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
  const title = create ? "Crear Mantenimiento Realizado" : "Editar Mantenimiento Realizado";
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

            {/* Fecha y Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="fecha_mantenimiento">Fecha de Mantenimiento</Label>
                <Input
                  id="fecha_mantenimiento"
                  type="date"
                  {...register("fecha_mantenimiento")}
                />
                {errors.fecha_mantenimiento && (
                  <p className="text-red-500 text-sm">{errors.fecha_mantenimiento.message}</p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={watch("tipo")}
                  onValueChange={(value) => setValue("tipo", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
                    <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
                    <SelectItem value="PREDICTIVO">Predictivo</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo && (
                  <p className="text-red-500 text-sm">{errors.tipo.message}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="grid gap-1">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el mantenimiento realizado..."
                {...register("descripcion")}
                rows={3}
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm">{errors.descripcion.message}</p>
              )}
            </div>

            {/* Averías Encontradas */}
            <div className="grid gap-1">
              <Label htmlFor="averias_encontradas">Averías Encontradas</Label>
              <Textarea
                id="averias_encontradas"
                placeholder="Describe las averías encontradas (si las hay)..."
                {...register("averias_encontradas")}
                rows={2}
              />
            </div>

            {/* Repuestos Utilizados */}
            <div className="grid gap-1">
              <Label htmlFor="repuestos_utilizados">Repuestos Utilizados</Label>
              <Textarea
                id="repuestos_utilizados"
                placeholder="Lista los repuestos utilizados..."
                {...register("repuestos_utilizados")}
                rows={2}
              />
            </div>

            {/* Responsable y Costo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="responsable">Responsable</Label>
                <Input
                  id="responsable"
                  type="text"
                  placeholder="Nombre del responsable"
                  {...register("responsable")}
                />
                {errors.responsable && (
                  <p className="text-red-500 text-sm">{errors.responsable.message}</p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="costo">Costo (COP)</Label>
                <Input
                  id="costo"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  {...register("costo")}
                />
              </div>
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

