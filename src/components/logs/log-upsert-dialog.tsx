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
  usuario_id: z.string().min(1, "Selecciona usuario"),
  accion: z.string().min(1, "Acción requerida"),
  descripcion: z.string().optional(),
});

type LogFormData = z.infer<typeof schema>;

type UsuarioOption = { id: number; nombre: string };

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  usuarios: UsuarioOption[];
  defaultValues?: Partial<LogFormData>;
  hiddenFields?: Record<string, string | number>;
};

export function LogUpsertDialog({
  serverAction,
  create = true,
  usuarios,
  defaultValues,
  hiddenFields,
}: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      usuario_id:
        defaultValues?.usuario_id ??
        (usuarios[0] ? String(usuarios[0].id) : ""),
      ...defaultValues,
    } as LogFormData,
  });

  const onSubmit = async (data: LogFormData) => {
    try {
      const formData = new FormData();

      // Agregar campos del formulario
      formData.append("usuario_id", data.usuario_id);
      formData.append("accion", data.accion);
      if (data.descripcion) formData.append("descripcion", data.descripcion);

      // Agregar campos ocultos
      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando log..." : "Actualizando log...",
        success: create
          ? "Log creado exitosamente"
          : "Log actualizado exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear log" : "Editar log";
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
            {/* Usuario */}
            <div className="grid gap-1">
              <Label htmlFor="usuario_id">Usuario</Label>
              <Select
                value={watch("usuario_id")}
                onValueChange={(value) => setValue("usuario_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona usuario" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.usuario_id && (
                <p className="text-red-500 text-sm">
                  {errors.usuario_id.message}
                </p>
              )}
            </div>

            {/* Acción */}
            <div className="grid gap-1">
              <Label htmlFor="accion">Acción</Label>
              <Input
                id="accion"
                type="text"
                placeholder="Descripción de la acción"
                {...register("accion")}
              />
              {errors.accion && (
                <p className="text-red-500 text-sm">{errors.accion.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="grid gap-1">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <textarea
                id="descripcion"
                rows={3}
                placeholder="Descripción adicional..."
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
