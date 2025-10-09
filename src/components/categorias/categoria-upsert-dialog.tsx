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
import { FormTextarea } from "../ui/form-textarea";
import { FormSwitch } from "../ui/form-switch";
import { toast } from "sonner";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  estado: z.enum(["activo", "inactivo"]),
});

type FormDataShape = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean; // true = crear, false = editar
  buttonText?: string; // override opcional
  title?: string; // override opcional
  submitText?: string; // override opcional
  defaultValues?: Partial<FormDataShape>; // valores iniciales para editar
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
  const formRef = useRef<HTMLFormElement | null>(null);

  const form = useForm<FormDataShape>({
    resolver: zodResolver(schema),
    defaultValues: { estado: "activo", ...defaultValues } as FormDataShape,
  });

  const onValid = async () => {
    try {
      formRef.current?.requestSubmit();
    } catch {
      // noop
    }
  };

  const onInvalid = () => toast.error("Revisa los campos del formulario");
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
              <FormField name="nombre" label="Nombre">
                <FormInput name="nombre" placeholder="Nombre" />
              </FormField>
              <FormField name="descripcion" label="Descripción">
                <FormTextarea
                  name="descripcion"
                  placeholder="Descripción"
                  rows={2}
                />
              </FormField>
              <FormField name="estado">
                <FormSwitch name="estado" label="Activo" />
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
