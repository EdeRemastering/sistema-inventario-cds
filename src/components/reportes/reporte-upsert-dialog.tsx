"use client";

import { useState } from "react";
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

const schema = z.object({
  tipo_reporte: z.string().min(1, "Tipo requerido"),
  nombre_archivo: z.string().min(1, "Nombre requerido"),
});

type ReporteFormData = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<ReporteFormData>;
  hiddenFields?: Record<string, string | number>;
};

export function ReporteUpsertDialog({
  serverAction,
  create = true,
  defaultValues,
  hiddenFields,
}: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReporteFormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues } as ReporteFormData,
  });

  const onSubmit = async (data: ReporteFormData) => {
    try {
      const formData = new FormData();

      // Agregar campos del formulario
      formData.append("tipo_reporte", data.tipo_reporte);
      formData.append("nombre_archivo", data.nombre_archivo);

      // Agregar campos ocultos
      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando reporte..." : "Actualizando reporte...",
        success: create
          ? "Reporte creado exitosamente"
          : "Reporte actualizado exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear reporte" : "Editar reporte";
  const submitText = create ? "Crear" : "Guardar cambios";

  return (
    <>
      <Button onClick={() => setOpen(true)}>{btnText}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            {/* Tipo de Reporte */}
            <div className="grid gap-1">
              <Label htmlFor="tipo_reporte">Tipo de Reporte</Label>
              <Input
                id="tipo_reporte"
                type="text"
                placeholder="Ej: Inventario General, Movimientos por Período"
                {...register("tipo_reporte")}
              />
              {errors.tipo_reporte && (
                <p className="text-red-500 text-sm">
                  {errors.tipo_reporte.message}
                </p>
              )}
            </div>

            {/* Nombre del Archivo */}
            <div className="grid gap-1">
              <Label htmlFor="nombre_archivo">Nombre del Archivo</Label>
              <Input
                id="nombre_archivo"
                type="text"
                placeholder="Ej: inventario_2024.pdf"
                {...register("nombre_archivo")}
              />
              {errors.nombre_archivo && (
                <p className="text-red-500 text-sm">
                  {errors.nombre_archivo.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
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
