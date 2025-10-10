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
  categoria_id: z.string().min(1, "Selecciona categoría"),
  subcategoria_id: z.string().optional(),
  serie: z.string().min(1, "Serie requerida"),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  cantidad: z.string().min(1, "Cantidad requerida"),
});

type ElementoFormData = z.infer<typeof schema>;

type CategoriaOption = { id: number; nombre: string };
type SubcategoriaOption = { id: number; nombre: string; categoria_id: number };

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  defaultValues?: Partial<ElementoFormData>;
  hiddenFields?: Record<string, string | number>;
};

export function ElementoUpsertDialog({
  serverAction,
  create = true,
  categorias,
  subcategorias,
  defaultValues,
  hiddenFields,
}: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ElementoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cantidad: "1",
      ...defaultValues,
    } as ElementoFormData,
  });

  // Filtrar subcategorías por categoría seleccionada
  const selectedCategoriaId = watch("categoria_id");
  const filteredSubcategorias = subcategorias.filter(
    (sub) => sub.categoria_id === parseInt(selectedCategoriaId || "0")
  );

  const onSubmit = async (data: ElementoFormData) => {
    try {
      const formData = new FormData();

      // Agregar campos del formulario
      formData.append("categoria_id", data.categoria_id);
      if (data.subcategoria_id)
        formData.append("subcategoria_id", data.subcategoria_id);
      formData.append("serie", data.serie);
      if (data.marca) formData.append("marca", data.marca);
      if (data.modelo) formData.append("modelo", data.modelo);
      formData.append("cantidad", data.cantidad);

      // Agregar campos ocultos
      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando elemento..." : "Actualizando elemento...",
        success: create
          ? "Elemento creado exitosamente"
          : "Elemento actualizado exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear elemento" : "Editar elemento";
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
            {/* Categoría */}
            <div className="grid gap-1">
              <Label htmlFor="categoria_id">Categoría</Label>
              <Select
                value={watch("categoria_id")}
                onValueChange={(value) => {
                  setValue("categoria_id", value);
                  setSelectedCategoriaId(value);
                  setValue("subcategoria_id", ""); // Reset subcategoría
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
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

            {/* Subcategoría */}
            <div className="grid gap-1">
              <Label htmlFor="subcategoria_id">Subcategoría</Label>
              <Select
                value={watch("subcategoria_id")}
                onValueChange={(value) => setValue("subcategoria_id", value)}
                disabled={!selectedCategoriaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona subcategoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin subcategoría</SelectItem>
                  {filteredSubcategorias.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subcategoria_id && (
                <p className="text-red-500 text-sm">
                  {errors.subcategoria_id.message}
                </p>
              )}
            </div>

            {/* Serie */}
            <div className="grid gap-1">
              <Label htmlFor="serie">Serie</Label>
              <Input
                id="serie"
                type="text"
                placeholder="Número de serie"
                {...register("serie")}
              />
              {errors.serie && (
                <p className="text-red-500 text-sm">{errors.serie.message}</p>
              )}
            </div>

            {/* Marca y Modelo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  type="text"
                  placeholder="Marca"
                  {...register("marca")}
                />
                {errors.marca && (
                  <p className="text-red-500 text-sm">{errors.marca.message}</p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  type="text"
                  placeholder="Modelo"
                  {...register("modelo")}
                />
                {errors.modelo && (
                  <p className="text-red-500 text-sm">
                    {errors.modelo.message}
                  </p>
                )}
              </div>
            </div>

            {/* Cantidad */}
            <div className="grid gap-1">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                {...register("cantidad")}
              />
              {errors.cantidad && (
                <p className="text-red-500 text-sm">
                  {errors.cantidad.message}
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
