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
  numero_ticket: z.string().min(1, "Número requerido"),
  fecha_salida: z.string().min(1, "Fecha salida requerida"),
  fecha_estimada_devolucion: z.string().optional(),
  elemento: z.string().optional(),
  serie: z.string().optional(),
  marca_modelo: z.string().optional(),
  cantidad: z.string().min(1, "Cantidad requerida"),
  dependencia_entrega: z.string().optional(),
  funcionario_entrega: z.string().optional(),
  dependencia_recibe: z.string().optional(),
  funcionario_recibe: z.string().optional(),
  motivo: z.string().optional(),
  orden_numero: z.string().optional(),
});

type FormShape = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<FormShape>;
  hiddenFields?: Record<string, string | number>;
};

export function TicketUpsertDialog({
  serverAction,
  create = true,
  defaultValues,
  hiddenFields,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const form = useForm<FormShape>({
    resolver: zodResolver(schema),
    defaultValues: {
      fecha_salida:
        defaultValues?.fecha_salida ?? new Date().toISOString().slice(0, 16),
      cantidad: defaultValues?.cantidad ?? "1",
      ...defaultValues,
    } as FormShape,
  });

  const onValid = () => formRef.current?.requestSubmit();
  const onInvalid = () => {};

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear ticket" : "Editar ticket";
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
              <FormField name="numero_ticket" label="Número ticket">
                <FormInput name="numero_ticket" />
              </FormField>
              <FormField name="fecha_salida" label="Fecha salida">
                <FormInput
                  name="fecha_salida"
                  type="datetime-local"
                  defaultValue={form.getValues("fecha_salida")}
                />
              </FormField>
              <FormField
                name="fecha_estimada_devolucion"
                label="Fecha estimada"
              >
                <FormInput
                  name="fecha_estimada_devolucion"
                  type="datetime-local"
                />
              </FormField>
              <FormField name="elemento" label="Elemento">
                <FormInput name="elemento" />
              </FormField>
              <FormField name="serie" label="Serie">
                <FormInput name="serie" />
              </FormField>
              <FormField name="marca_modelo" label="Marca/Modelo">
                <FormInput name="marca_modelo" />
              </FormField>
              <FormField name="cantidad" label="Cantidad">
                <FormInput
                  name="cantidad"
                  type="number"
                  min={1}
                  defaultValue="1"
                />
              </FormField>
              <FormField name="dependencia_entrega" label="Dep. entrega">
                <FormInput name="dependencia_entrega" />
              </FormField>
              <FormField name="funcionario_entrega" label="Func. entrega">
                <FormInput name="funcionario_entrega" />
              </FormField>
              <FormField name="dependencia_recibe" label="Dep. recibe">
                <FormInput name="dependencia_recibe" />
              </FormField>
              <FormField name="funcionario_recibe" label="Func. recibe">
                <FormInput name="funcionario_recibe" />
              </FormField>
              <FormField name="motivo" label="Motivo">
                <FormInput name="motivo" />
              </FormField>
              <FormField name="orden_numero" label="Orden">
                <FormInput name="orden_numero" />
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
