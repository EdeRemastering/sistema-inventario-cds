"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
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
import { SignaturePadComponent } from "../ui/signature-pad";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const createSchema = z.object({
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().optional().or(z.literal("")),
  firma: z.string().optional().or(z.literal("")),
  rol: z.enum(["administrador", "usuario"]),
  activo: z.boolean().optional(),
});

const updateSchema = z.object({
  password: z
    .union([
      z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
      z.literal(""),
    ])
    .optional(),
  nombre: z.string().min(1, "El nombre es requerido").optional(),
  apellido: z.string().optional().or(z.literal("")),
  firma: z.string().optional().or(z.literal("")),
  rol: z.enum(["administrador", "usuario"]),
  activo: z.boolean().optional(),
});

type UsuarioFormData = {
  username?: string;
  password?: string;
  nombre: string;
  apellido: string;
  firma?: string;
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
  const [firma, setFirma] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(
      create ? createSchema : updateSchema
    ) as Resolver<UsuarioFormData>,
    defaultValues: {
      rol: "usuario",
      activo: true,
      firma: "",
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
      formData.append("apellido", data.apellido);
      formData.append("rol", data.rol);
      formData.append("activo", String(data.activo ?? true));
      if (firma) formData.append("firma", firma);

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
      setFirma(null);
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
      <Button
        onClick={() => setOpen(true)}
        data-tour={create ? "usuarios-create-button" : "usuarios-edit-button"}
      >
        {computedButton}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-tour="usuario-form"
          className="max-h-[90dvh] sm:max-h-[90vh]"
        >
          <DialogHeader>
            <DialogTitle>{computedTitle}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid min-w-0 w-full max-w-full gap-3"
          >
            <input type="hidden" {...register("firma")} />
            {create && (
              <div
                className="grid min-w-0 gap-1"
                data-tour="usuario-form-username"
              >
                <Label htmlFor="username">Nombre de usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ej: eder.mestra"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>
            )}
            <div
              className="grid min-w-0 gap-1"
              data-tour="usuario-form-password"
            >
              <Label htmlFor="password">
                {create ? "Contraseña" : "Nueva contraseña (opcional)"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mín. 6 caracteres"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="grid min-w-0 gap-1" data-tour="usuario-form-nombre">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Eder"
                {...register("nombre")}
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre.message}</p>
              )}
            </div>
            <div
              className="grid min-w-0 gap-1"
              data-tour="usuario-form-apellido"
            >
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                type="text"
                placeholder="Mestra"
                {...register("apellido")}
              />
              {errors.apellido && (
                <p className="text-red-500 text-sm">
                  {errors.apellido.message}
                </p>
              )}
            </div>

            <div className="grid min-w-0 gap-2" data-tour="usuario-form-firma">
              <Label>Firma del usuario</Label>
              <div className="min-w-0 w-full max-w-full overflow-hidden rounded-md border p-2 sm:max-w-md sm:mx-auto">
                <SignaturePadComponent
                  onSignatureChange={(dataUrl) => {
                    setFirma(dataUrl);
                    setValue("firma", dataUrl ?? "");
                  }}
                />
              </div>
              {errors.firma ? (
                <p className="text-red-500 text-sm">{errors.firma.message}</p>
              ) : null}
            </div>
            <div className="grid min-w-0 gap-1" data-tour="usuario-form-rol">
              <Label htmlFor="rol">Rol</Label>
              <Select
                value={watch("rol")}
                onValueChange={(value) =>
                  setValue("rol", value as "administrador" | "usuario")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">Usuario</SelectItem>
                  <SelectItem value="administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
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
              <Button
                type="submit"
                disabled={isSubmitting}
                data-tour="usuario-form-submit"
              >
                {computedSubmit}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
