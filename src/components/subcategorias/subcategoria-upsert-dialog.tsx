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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  categoria_id: z.string().min(1, "Selecciona una categoría"),
});

type SubcategoriaFormData = z.infer<typeof schema>;

type CategoriaOption = { id: number; nombre: string };

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean; // true crear, false editar
  categorias: CategoriaOption[];
  defaultValues?: Partial<SubcategoriaFormData>;
  hiddenFields?: Record<string, string | number>;
};

export function SubcategoriaUpsertDialog({
  serverAction,
  create = true,
  categorias,
  defaultValues,
  hiddenFields,
}: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubcategoriaFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoria_id:
        defaultValues?.categoria_id ??
        (categorias[0] ? String(categorias[0].id) : ""),
      ...defaultValues,
    } as SubcategoriaFormData,
  });

  const onSubmit = async (data: SubcategoriaFormData) => {
    try {
      const formData = new FormData();

      // Agregar campos del formulario
      formData.append("nombre", data.nombre);
      if (data.descripcion) formData.append("descripcion", data.descripcion);
      formData.append("categoria_id", data.categoria_id);

      // Agregar campos ocultos
      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create
          ? "Creando subcategoría..."
          : "Actualizando subcategoría...",
        success: create
          ? "Subcategoría creada exitosamente"
          : "Subcategoría actualizada exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear subcategoría" : "Editar subcategoría";
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
            <div className="grid gap-1">
              <Label htmlFor="categoria_id">Categoría</Label>
              <Select
                value={watch("categoria_id")}
                onValueChange={(value) => setValue("categoria_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria_id && (
                <p className="text-red-500 text-sm">
                  {errors.categoria_id.message}
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
