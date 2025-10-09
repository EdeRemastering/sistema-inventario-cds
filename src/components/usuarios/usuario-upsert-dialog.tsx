"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { FormField } from "../ui/form-field";
import { FormInput } from "../ui/form-input";
import { FormSelect } from "../ui/form-select";
import { FormSwitch } from "../ui/form-switch";
import { toast } from "sonner";

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

type CreateFormDataShape = z.infer<typeof createSchema>;
type UpdateFormDataShape = z.infer<typeof updateSchema>;
type FormDataShape = CreateFormDataShape & UpdateFormDataShape;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean; // true = crear, false = editar
  buttonText?: string; // override opcional
  title?: string; // override opcional
  submitText?: string; // override opcional
  defaultValues?: Partial<FormDataShape>; // valores iniciales para editar
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
  const formRef = useRef<HTMLFormElement | null>(null);

  const schema = create ? createSchema : updateSchema;

  const form = useForm<FormDataShape>({
    resolver: zodResolver(schema),
    defaultValues: {
      rol: "usuario",
      activo: true,
      ...defaultValues,
    } as FormDataShape,
  });

  const onValid = async () => {
    try {
      formRef.current?.requestSubmit();
    } catch {
      // noop
    }
  };

  const onInvalid = () => toast.error("Revisa los campos del formulario");
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
          <Form {...form}>
            <form ref={formRef} action={serverAction} className="grid gap-3">
              {hiddenFields &&
                Object.entries(hiddenFields).map(([name, value]) => (
                  <input
                    key={name}
                    type="hidden"
                    name={name}
                    value={String(value)}
                  />
                ))}
              {create && (
                <FormField name="username" label="Nombre de usuario">
                  <FormInput name="username" placeholder="usuario123" />
                </FormField>
              )}
              <FormField
                name="password"
                label={create ? "Contraseña" : "Nueva contraseña (opcional)"}
              >
                <FormInput
                  name="password"
                  type="password"
                  placeholder="••••••••"
                />
              </FormField>
              <FormField name="nombre" label="Nombre completo">
                <FormInput name="nombre" placeholder="Juan Pérez" />
              </FormField>
              <FormField name="rol" label="Rol">
                <FormSelect
                  name="rol"
                  options={[
                    { value: "usuario", label: "Usuario" },
                    { value: "administrador", label: "Administrador" },
                  ]}
                />
              </FormField>
              <FormField name="activo">
                <FormSwitch name="activo" label="Usuario activo" />
              </FormField>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={form.handleSubmit(onValid, onInvalid)}
                >
                  {computedSubmit}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
