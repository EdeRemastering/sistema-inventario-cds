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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const schema = z.object({
  sede_id: z.string().min(1, "Selecciona sede"),
  ubicacion_id: z.string().min(1, "Selecciona ubicación"),
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
type UbicacionOption = { id: number; codigo: string; nombre: string; sede_id: number };
type SedeOption = { id: number; nombre: string; ciudad: string; municipio: string | null };

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  sedes: SedeOption[];
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  ubicaciones: UbicacionOption[];
  defaultValues?: Partial<ElementoFormData>;
  hiddenFields?: Record<string, string | number>;
  onClose?: () => void;
};

export function ElementoUpsertDialog({
  serverAction,
  create = true,
  sedes,
  categorias,
  subcategorias,
  ubicaciones,
  defaultValues,
  hiddenFields,
  onClose,
}: Props) {
  // El modal siempre empieza cerrado, se abre al hacer clic en el botón
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ElementoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sede_id: defaultValues?.sede_id || "",
      ubicacion_id: defaultValues?.ubicacion_id || "",
      categoria_id: defaultValues?.categoria_id || "",
      subcategoria_id: defaultValues?.subcategoria_id || "",
      serie: defaultValues?.serie || "",
      marca: defaultValues?.marca || "",
      modelo: defaultValues?.modelo || "",
      cantidad: defaultValues?.cantidad || "1",
    },
  });

  // Reinicializar formulario cuando cambian los defaultValues
  useEffect(() => {
    if (defaultValues) {
      reset({
        sede_id: defaultValues.sede_id || "",
        ubicacion_id: defaultValues.ubicacion_id || "",
        categoria_id: defaultValues.categoria_id || "",
        subcategoria_id: defaultValues.subcategoria_id || "",
        serie: defaultValues.serie || "",
        marca: defaultValues.marca || "",
        modelo: defaultValues.modelo || "",
        cantidad: defaultValues.cantidad || "1",
      });
    }
  }, [defaultValues, reset]);

  // Filtrar ubicaciones por sede seleccionada
  const selectedSedeId = watch("sede_id");
  const filteredUbicaciones = ubicaciones.filter(
    (u) => u.sede_id === parseInt(selectedSedeId || "0")
  );

  // Filtrar subcategorías por categoría seleccionada
  const selectedCategoriaId = watch("categoria_id");
  const filteredSubcategorias = subcategorias.filter(
    (sub) => sub.categoria_id === parseInt(selectedCategoriaId || "0")
  );

  const onSubmit = async (data: ElementoFormData) => {
    try {
      const formData = new FormData();

      // Agregar campos del formulario en el orden correcto
      formData.append("ubicacion_id", data.ubicacion_id);
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
      if (onClose) onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear elemento" : "Editar elemento";
  const submitText = create ? "Crear" : "Guardar cambios";

  return (
    <>
      {create && <Button onClick={() => setOpen(true)}>{btnText}</Button>}
      {!create && <Button variant="outline" size="sm" onClick={() => setOpen(true)}>{btnText}</Button>}
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen && onClose) onClose();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            {/* Sede */}
            <div className="grid gap-1">
              <Label htmlFor="sede_id">Sede</Label>
              <Select
                value={watch("sede_id")}
                onValueChange={(value) => {
                  setValue("sede_id", value);
                  setValue("ubicacion_id", ""); // Reset ubicación al cambiar sede
                }}
                disabled={sedes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    sedes.length === 0 
                      ? "No hay sedes disponibles" 
                      : "Selecciona sede"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {sedes.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">No hay sedes disponibles</p>
                      <p className="text-xs mt-1">
                        Crea sedes en la configuración del sistema
                      </p>
                    </div>
                  ) : (
                    sedes.map((sede) => (
                      <SelectItem key={sede.id} value={sede.id.toString()}>
                        {sede.nombre} - {sede.ciudad}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.sede_id && (
                <p className="text-red-500 text-sm">
                  {errors.sede_id.message}
                </p>
              )}
            </div>

            {/* Ubicación */}
            <div className="grid gap-1">
              <Label htmlFor="ubicacion_id">Ubicación</Label>
              <Select
                value={watch("ubicacion_id") || undefined}
                onValueChange={(value) =>
                  setValue("ubicacion_id", value || "")
                }
                disabled={!selectedSedeId || filteredUbicaciones.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedSedeId 
                      ? "Primero selecciona una sede" 
                      : filteredUbicaciones.length === 0 
                        ? "No hay ubicaciones disponibles" 
                        : "Selecciona ubicación"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredUbicaciones.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">
                        {!selectedSedeId 
                          ? "Selecciona una sede primero" 
                          : "No hay ubicaciones disponibles"}
                      </p>
                      <p className="text-xs mt-1">
                        {!selectedSedeId 
                          ? "Debes seleccionar una sede para ver sus ubicaciones" 
                          : "Crea ubicaciones para esta sede en la configuración"}
                      </p>
                    </div>
                  ) : (
                    filteredUbicaciones.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.codigo} - {u.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.ubicacion_id && (
                <p className="text-red-500 text-sm">
                  {errors.ubicacion_id.message}
                </p>
              )}
            </div>

            {/* Categoría */}
            <div className="grid gap-1">
              <Label htmlFor="categoria_id">Categoría</Label>
              <Select
                value={watch("categoria_id")}
                onValueChange={(value) => {
                  setValue("categoria_id", value);
                  setValue("subcategoria_id", ""); // Reset subcategoría
                }}
                disabled={categorias.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    categorias.length === 0 
                      ? "No hay categorías disponibles" 
                      : "Selecciona categoría"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {categorias.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">No hay categorías disponibles</p>
                      <p className="text-xs mt-1">
                        Crea categorías en la configuración del sistema
                      </p>
                    </div>
                  ) : (
                    categorias.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nombre}
                      </SelectItem>
                    ))
                  )}
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
                value={watch("subcategoria_id") || undefined}
                onValueChange={(value) =>
                  setValue("subcategoria_id", value || "")
                }
                disabled={!selectedCategoriaId || filteredSubcategorias.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedCategoriaId 
                      ? "Primero selecciona una categoría" 
                      : filteredSubcategorias.length === 0 
                        ? "No hay subcategorías disponibles" 
                        : "Selecciona subcategoría"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategorias.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                      <p className="font-medium">
                        {!selectedCategoriaId 
                          ? "Selecciona una categoría primero" 
                          : "No hay subcategorías disponibles"}
                      </p>
                      <p className="text-xs mt-1">
                        {!selectedCategoriaId 
                          ? "Debes seleccionar una categoría para ver sus subcategorías" 
                          : "Crea subcategorías para esta categoría en la configuración"}
                      </p>
                    </div>
                  ) : (
                    filteredSubcategorias.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.nombre}
                      </SelectItem>
                    ))
                  )}
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
