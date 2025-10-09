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

const createSchema = z.object({
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido"),
  rol: z.enum(["administrador", "usuario"]),
  activo: z.boolean().optional(),
});

const updateSchema = z.object({
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional(),
  nombre: z.string().min(1, "El nombre es requerido"),
  rol: z.enum(["administrador", "usuario"]),
  activo: z.boolean().optional(),
});

type UsuarioFormData = {
  username?: string;
  password?: string;
  nombre: string;
  rol: "administrador" | "usuario";
  activo?: boolean;
};

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean; // true = crear, false = editar
  buttonText?: string; // override opcional
  title?: string; // override opcional
  submitText?: string; // override opcional
  defaultValues?: Partial<UsuarioFormData>; // valores iniciales para editar
  hiddenFields?: Record<string, string | number>; // campos extra ocultos (p.ej., id)
};

export function UsuarioUpsertDialog({
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
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(create ? createSchema : updateSchema),
    defaultValues: {
      rol: "usuario",
      activo: true,
      ...defaultValues,
    } as UsuarioFormData,
  });

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      const formData = new FormData();

      // Agregar campos del formulario
      if (create && data.username) formData.append("username", data.username);
      if (data.password) formData.append("password", data.password);
      formData.append("nombre", data.nombre);
      formData.append("rol", data.rol);
      formData.append("activo", String(data.activo ?? true));

      // Agregar campos ocultos
      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando usuario..." : "Actualizando usuario...",
        success: create
          ? "Usuario creado exitosamente"
          : "Usuario actualizado exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const computedButton = buttonText ?? (create ? "Nuevo usuario" : "Editar");
  const computedTitle = title ?? (create ? "Crear usuario" : "Editar usuario");
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
            {create && (
              <div className="grid gap-1">
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="usuario123"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>
            )}
            <div className="grid gap-1">
              <Label htmlFor="password">
                {create ? "Contraseña" : "Nueva contraseña (opcional)"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Juan Pérez"
                {...register("nombre")}
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre.message}</p>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="rol">Rol</Label>
              <select
                id="rol"
                {...register("rol")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="usuario">Usuario</option>
                <option value="administrador">Administrador</option>
              </select>
              {errors.rol && (
                <p className="text-red-500 text-sm">{errors.rol.message}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="activo"
                type="checkbox"
                {...register("activo")}
                className="h-4 w-4 rounded border border-input bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Label htmlFor="activo">Usuario activo</Label>
            </div>
            {errors.activo && (
              <p className="text-red-500 text-sm">{errors.activo.message}</p>
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
