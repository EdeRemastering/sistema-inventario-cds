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
  fecha_observacion: z.string().min(1, "Fecha requerida"),
  descripcion: z.string().min(1, "Descripción requerida"),
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

export function ObservacionUpsertDialog({
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
      fecha_observacion:
        defaultValues?.fecha_observacion ??
        new Date().toISOString().slice(0, 10),
      ...defaultValues,
    } as FormShape,
  });

  const onValid = () => formRef.current?.requestSubmit();
  const onInvalid = () => {};

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear observación" : "Editar observación";
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
              <FormField name="fecha_observacion" label="Fecha">
                <FormInput
                  name="fecha_observacion"
                  type="date"
                  defaultValue={form.getValues("fecha_observacion")}
                />
              </FormField>
              <FormField name="descripcion" label="Descripción">
                <FormInput name="descripcion" />
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
