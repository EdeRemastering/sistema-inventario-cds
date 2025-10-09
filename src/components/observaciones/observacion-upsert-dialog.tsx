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
  elemento_id: z.string().min(1, "Selecciona elemento"),
  fecha_observacion: z.string().min(1, "Fecha requerida"),
  descripcion: z.string().min(1, "Descripción requerida"),
});

type ObservacionFormData = z.infer<typeof schema>;

type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
};

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  elementos: ElementoOption[];
  defaultValues?: Partial<ObservacionFormData>;
  hiddenFields?: Record<string, string | number>;
};

export function ObservacionUpsertDialog({
  serverAction,
  create = true,
  elementos,
  defaultValues,
  hiddenFields,
}: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ObservacionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultValues,
    } as ObservacionFormData,
  });

  const onSubmit = async (data: ObservacionFormData) => {
    try {
      const formData = new FormData();

      // Agregar campos del formulario
      formData.append("elemento_id", data.elemento_id);
      formData.append("fecha_observacion", data.fecha_observacion);
      formData.append("descripcion", data.descripcion);

      // Agregar campos ocultos
      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create
          ? "Creando observación..."
          : "Actualizando observación...",
        success: create
          ? "Observación creada exitosamente"
          : "Observación actualizada exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear observación" : "Editar observación";
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
            {/* Elemento */}
            <div className="grid gap-1">
              <Label htmlFor="elemento_id">Elemento</Label>
              <select
                id="elemento_id"
                {...register("elemento_id")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  Selecciona elemento
                </option>
                {elementos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.serie} - {e.marca} {e.modelo}
                  </option>
                ))}
              </select>
              {errors.elemento_id && (
                <p className="text-red-500 text-sm">
                  {errors.elemento_id.message}
                </p>
              )}
            </div>

            {/* Fecha de Observación */}
            <div className="grid gap-1">
              <Label htmlFor="fecha_observacion">Fecha de Observación</Label>
              <Input
                id="fecha_observacion"
                type="datetime-local"
                {...register("fecha_observacion")}
              />
              {errors.fecha_observacion && (
                <p className="text-red-500 text-sm">
                  {errors.fecha_observacion.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="grid gap-1">
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                rows={4}
                placeholder="Describe la observación..."
                {...register("descripcion")}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm">
                  {errors.descripcion.message}
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
