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

const schema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  categoria_id: z.string().min(1, "Selecciona una categoría"),
});

type FormShape = z.infer<typeof schema>;

type CategoriaOption = { id: number; nombre: string };

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean; // true crear, false editar
  categorias: CategoriaOption[];
  defaultValues?: Partial<FormShape>;
  hiddenFields?: Record<string, string | number>;
};

export function SubcategoriaUpsertDialog({
  serverAction,
  create = true,
  categorias,
  defaultValues,
  hiddenFields,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const form = useForm<FormShape>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoria_id:
        defaultValues?.categoria_id ??
        (categorias[0] ? String(categorias[0].id) : ""),
      ...defaultValues,
    } as FormShape,
  });

  const onValid = () => formRef.current?.requestSubmit();
  const onInvalid = () => {};

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear subcategoría" : "Editar subcategoría";
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
              <div className="grid gap-1">
                <label className="text-sm font-medium" htmlFor="categoria_id">
                  Categoría
                </label>
                <select
                  id="categoria_id"
                  name="categoria_id"
                  defaultValue={form.getValues("categoria_id")}
                  onChange={(e) =>
                    form.setValue("categoria_id", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-primary/40 h-9 w-full min-w-0 rounded-md border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] hover:border-primary/60"
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
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
