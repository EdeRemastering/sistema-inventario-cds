"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { FormField } from "../ui/form-field";
import { FormInput } from "../ui/form-input";
import { FormTextarea } from "../ui/form-textarea";
import { FormSwitch } from "../ui/form-switch";
import { toast } from "sonner";
import { useRef } from "react";

const categoriaFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  estado: z.enum(["activo", "inactivo"]),
});

type CategoriaFormData = z.infer<typeof categoriaFormSchema>;

type CategoriaFormProps = {
  serverAction: (formData: FormData) => Promise<void>;
  submitText?: string;
  defaultValues?: Partial<CategoriaFormData>;
};

export function CategoriaForm({
  serverAction,
  submitText = "Crear",
  defaultValues,
}: CategoriaFormProps) {
  const form = useForm<CategoriaFormData>({
    resolver: zodResolver(categoriaFormSchema),
    defaultValues: {
      estado: "activo",
      ...defaultValues,
    },
  });

  const formRef = useRef<HTMLFormElement | null>(null);
  const submitWithValidation = form.handleSubmit(
    async () => {
      try {
        // Si la validación pasa, disparamos el submit nativo hacia la server action
        formRef.current?.requestSubmit();
      } catch {
        // noop
      }
    },
    () => {
      toast.error("Revisa los campos del formulario");
    }
  );

  return (
    <Form {...form}>
      <form
        ref={formRef}
        action={serverAction}
        className="grid gap-3 sm:grid-cols-3"
      >
        <FormField name="nombre" label="Nombre">
          <FormInput name="nombre" placeholder="Nombre" />
        </FormField>

        <FormField name="descripcion" label="Descripción">
          <FormTextarea name="descripcion" placeholder="Descripción" rows={1} />
        </FormField>

        <div className="flex items-center gap-4">
          <FormField name="estado">
            <FormSwitch name="estado" label="Activo" />
          </FormField>
          <Button
            type="button"
            onClick={submitWithValidation}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Guardando..." : submitText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
