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

const schema = z.object({
  tipo_reporte: z.string().min(1, "Tipo requerido"),
  nombre_archivo: z.string().min(1, "Nombre requerido"),
});

type FormShape = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<FormShape>;
  hiddenFields?: Record<string, string | number>;
};

export function ReporteUpsertDialog({
  serverAction,
  create = true,
  defaultValues,
  hiddenFields,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const form = useForm<FormShape>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues } as FormShape,
  });

  const onValid = () => formRef.current?.requestSubmit();
  const onInvalid = () => {};

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear reporte" : "Editar reporte";
  const submitText = create ? "Crear" : "Guardar cambios";

  return (
    <>
      <Button onClick={() => setOpen(true)}>{btnText}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form ref={formRef} action={serverAction} className="grid gap-3">
              {hiddenFields &&
                Object.entries(hiddenFields).map(([n, v]) => (
                  <input key={n} type="hidden" name={n} value={String(v)} />
                ))}
              <FormField name="tipo_reporte" label="Tipo de reporte">
                <FormInput name="tipo_reporte" placeholder="Tipo" />
              </FormField>
              <FormField name="nombre_archivo" label="Nombre del archivo">
                <FormInput name="nombre_archivo" placeholder="Nombre" />
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
                  {submitText}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
