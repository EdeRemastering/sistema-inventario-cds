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
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { Ubicacion } from "../../modules/ubicaciones/types";
import type { Sede } from "../../modules/sedes/types";

const schema = z.object({
  codigo: z.string().min(1, "Código requerido").max(20),
  nombre: z.string().min(1, "Nombre requerido").max(100),
  sede_id: z.string().min(1, "Sede requerida"),
  activo: z.boolean(),
});

type UbicacionFormData = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<Ubicacion>;
  sedes: Sede[];
  hiddenFields?: Record<string, string | number>;
  onClose?: () => void;
};

export function UbicacionUpsertDialog({
  serverAction,
  create = true,
  defaultValues,
  sedes,
  hiddenFields,
  onClose,
}: Props) {
  // Para crear: empieza cerrado (el botón lo abre)
  // Para editar: empieza abierto inmediatamente
  const [open, setOpen] = useState(false);

  // Abrir automáticamente cuando es modo edición y hay valores
  useEffect(() => {
    if (!create && defaultValues) {
      setOpen(true);
    }
  }, [create, defaultValues]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UbicacionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      codigo: defaultValues?.codigo || "",
      nombre: defaultValues?.nombre || "",
      sede_id: defaultValues?.sede_id?.toString() || "",
      activo: defaultValues?.activo ?? true,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        codigo: defaultValues.codigo || "",
        nombre: defaultValues.nombre || "",
        sede_id: defaultValues.sede_id?.toString() || "",
        activo: defaultValues.activo ?? true,
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: UbicacionFormData) => {
    try {
      const formData = new FormData();

      formData.append("codigo", data.codigo);
      formData.append("nombre", data.nombre);
      formData.append("sede_id", data.sede_id);
      formData.append("activo", String(data.activo));

      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando ubicación..." : "Actualizando ubicación...",
        success: create
          ? "Ubicación creada exitosamente"
          : "Ubicación actualizada exitosamente",
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
  const title = create ? "Crear ubicación" : "Editar ubicación";
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            {/* Código */}
            <div className="grid gap-1">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                type="text"
                placeholder="Ej: SS02"
                {...register("codigo")}
              />
              {errors.codigo && (
                <p className="text-red-500 text-sm">{errors.codigo.message}</p>
              )}
            </div>

            {/* Nombre */}
            <div className="grid gap-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Ej: SALA DE SISTEMAS N°2"
                {...register("nombre")}
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre.message}</p>
              )}
            </div>

            {/* Sede */}
            <div className="grid gap-1">
              <Label htmlFor="sede_id">Sede</Label>
              <Select
                value={watch("sede_id") || undefined}
                onValueChange={(value) =>
                  setValue("sede_id", value || "")
                }
                disabled={sedes.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    sedes.length === 0 
                      ? "No hay sedes disponibles" 
                      : "Selecciona una sede"
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
                <p className="text-red-500 text-sm">{errors.sede_id.message}</p>
              )}
            </div>

            {/* Activo */}
            <div className="flex items-center gap-2">
              <Switch
                id="activo"
                checked={watch("activo")}
                onCheckedChange={(checked) => setValue("activo", checked)}
              />
              <Label htmlFor="activo">Activo</Label>
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

