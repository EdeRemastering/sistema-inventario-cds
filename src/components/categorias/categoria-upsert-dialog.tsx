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
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  estado: z.boolean().optional(),
});

type CategoriaFormData = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean; // true = crear, false = editar
  buttonText?: string; // override opcional
  title?: string; // override opcional
  submitText?: string; // override opcional
  defaultValues?: Partial<CategoriaFormData>; // valores iniciales para editar
  hiddenFields?: Record<string, string | number>; // campos extra ocultos (p.ej., id)
};

export function CategoriaUpsertDialog({
  serverAction,
  create = true,
  buttonText,
  title,
  submitText,
  defaultValues,
  hiddenFields,
}: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      estado: true,
      ...defaultValues,
    } as CategoriaFormData,
  });

  const onSubmit = async (data: CategoriaFormData) => {
    try {
      const formData = new FormData();

      // Agregar campos del formulario
      formData.append("nombre", data.nombre);
      if (data.descripcion) formData.append("descripcion", data.descripcion);
      formData.append("estado", data.estado ? "activo" : "inactivo");

      // Agregar campos ocultos
      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando categoría..." : "Actualizando categoría...",
        success: create
          ? "Categoría creada exitosamente"
          : "Categoría actualizada exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const computedButton = buttonText ?? (create ? "Crear" : "Editar");
  const computedTitle =
    title ?? (create ? "Crear categoría" : "Editar categoría");
  const computedSubmit = submitText ?? (create ? "Crear" : "Guardar cambios");

  return (
    <>
      <Button onClick={() => setOpen(true)}>{computedButton}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{computedTitle}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Nombre"
                {...register("nombre")}
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre.message}</p>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                placeholder="Descripción"
                rows={2}
                {...register("descripcion")}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm">
                  {errors.descripcion.message}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="estado"
                type="checkbox"
                {...register("estado")}
                className="h-4 w-4 rounded border border-input bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Label htmlFor="estado">Activo</Label>
            </div>
            {errors.estado && (
              <p className="text-red-500 text-sm">{errors.estado.message}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {computedSubmit}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
