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
  elemento_id: z.string().min(1, "Selecciona elemento"),
  cantidad: z.string().min(1, "Cantidad requerida"),
  orden_numero: z.string().optional(),
  fecha_movimiento: z.string().min(1, "Fecha requerida"),
  dependencia_entrega: z.string().min(1, "Requerido"),
  funcionario_entrega: z.string().min(1, "Requerido"),
  cargo_funcionario_entrega: z.string().optional(),
  dependencia_recibe: z.string().min(1, "Requerido"),
  funcionario_recibe: z.string().min(1, "Requerido"),
  cargo_funcionario_recibe: z.string().optional(),
  motivo: z.string().optional(),
  fecha_estimada_devolucion: z.string().min(1, "Requerido"),
  numero_ticket: z.string().optional(),
  observaciones_entrega: z.string().optional(),
});

type FormShape = z.infer<typeof schema>;

type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
};

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  elementos: ElementoOption[];
  defaultValues?: Partial<FormShape>;
  hiddenFields?: Record<string, string | number>;
};

export function MovimientoUpsertDialog({
  serverAction,
  create = true,
  elementos,
  defaultValues,
  hiddenFields,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const form = useForm<FormShape>({
    resolver: zodResolver(schema),
    defaultValues: {
      elemento_id:
        defaultValues?.elemento_id ??
        (elementos[0] ? String(elementos[0].id) : ""),
      fecha_movimiento:
        defaultValues?.fecha_movimiento ??
        new Date().toISOString().slice(0, 16),
      fecha_estimada_devolucion:
        defaultValues?.fecha_estimada_devolucion ??
        new Date().toISOString().slice(0, 10),
      cantidad: defaultValues?.cantidad ?? "1",
      ...defaultValues,
    } as FormShape,
  });

  const onValid = () => formRef.current?.requestSubmit();
  const onInvalid = () => {};

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear movimiento" : "Editar movimiento";
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

              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="elemento_id">
                  Elemento
                </label>
                <select
                  id="elemento_id"
                  name="elemento_id"
                  defaultValue={form.getValues("elemento_id")}
                  onChange={(e) =>
                    form.setValue("elemento_id", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-primary/40 h-9 w-full min-w-0 rounded-md border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] hover:border-primary/60"
                >
                  <option value="" disabled>
                    Selecciona elemento
                  </option>
                  {elementos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {`${e.serie} - ${e.marca || ""} ${e.modelo || ""}`.trim()}
                    </option>
                  ))}
                </select>
              </div>

              <FormField name="cantidad" label="Cantidad">
                <FormInput
                  name="cantidad"
                  type="number"
                  min={1}
                  defaultValue="1"
                />
              </FormField>
              <FormField name="orden_numero" label="Orden">
                <FormInput name="orden_numero" />
              </FormField>
              <FormField name="fecha_movimiento" label="Fecha movimiento">
                <FormInput
                  name="fecha_movimiento"
                  type="datetime-local"
                  defaultValue={form.getValues("fecha_movimiento")}
                />
              </FormField>
              <FormField name="dependencia_entrega" label="Dep. entrega">
                <FormInput name="dependencia_entrega" />
              </FormField>
              <FormField name="funcionario_entrega" label="Func. entrega">
                <FormInput name="funcionario_entrega" />
              </FormField>
              <FormField name="cargo_funcionario_entrega" label="Cargo entrega">
                <FormInput name="cargo_funcionario_entrega" />
              </FormField>
              <FormField name="dependencia_recibe" label="Dep. recibe">
                <FormInput name="dependencia_recibe" />
              </FormField>
              <FormField name="funcionario_recibe" label="Func. recibe">
                <FormInput name="funcionario_recibe" />
              </FormField>
              <FormField name="cargo_funcionario_recibe" label="Cargo recibe">
                <FormInput name="cargo_funcionario_recibe" />
              </FormField>
              <FormField name="numero_ticket" label="Nº Ticket">
                <FormInput name="numero_ticket" />
              </FormField>
              <FormField
                name="fecha_estimada_devolucion"
                label="Fecha estimada devolución"
              >
                <FormInput
                  name="fecha_estimada_devolucion"
                  type="date"
                  defaultValue={form.getValues("fecha_estimada_devolucion")}
                />
              </FormField>
              <FormField name="observaciones_entrega" label="Observaciones">
                <FormInput name="observaciones_entrega" />
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
