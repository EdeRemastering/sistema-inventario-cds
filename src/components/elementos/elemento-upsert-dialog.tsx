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
  categoria_id: z.string().min(1, "Selecciona categoría"),
  subcategoria_id: z.string().optional(),
  serie: z.string().min(1, "Serie requerida"),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  cantidad: z.string().min(1, "Cantidad requerida"),
});

type FormShape = z.infer<typeof schema>;

type CategoriaOption = { id: number; nombre: string };
type SubcategoriaOption = { id: number; nombre: string };

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  defaultValues?: Partial<FormShape>;
  hiddenFields?: Record<string, string | number>;
};

export function ElementoUpsertDialog({
  serverAction,
  create = true,
  categorias,
  subcategorias,
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
      subcategoria_id: defaultValues?.subcategoria_id ?? "",
      cantidad: defaultValues?.cantidad ?? "1",
      ...defaultValues,
    } as FormShape,
  });

  const onValid = () => formRef.current?.requestSubmit();
  const onInvalid = () => {};

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear elemento" : "Editar elemento";
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
                    Selecciona categoría
                  </option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1">
                <label
                  className="text-sm font-medium"
                  htmlFor="subcategoria_id"
                >
                  Subcategoría
                </label>
                <select
                  id="subcategoria_id"
                  name="subcategoria_id"
                  defaultValue={form.getValues("subcategoria_id")}
                  onChange={(e) =>
                    form.setValue("subcategoria_id", e.target.value)
                  }
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-primary/40 h-9 w-full min-w-0 rounded-md border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] hover:border-primary/60"
                >
                  <option value="">—</option>
                  {subcategorias.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <FormField name="serie" label="Serie">
                <FormInput name="serie" placeholder="Serie" />
              </FormField>
              <FormField name="marca" label="Marca">
                <FormInput name="marca" placeholder="Marca" />
              </FormField>
              <FormField name="modelo" label="Modelo">
                <FormInput name="modelo" placeholder="Modelo" />
              </FormField>
              <FormField name="cantidad" label="Cantidad">
                <FormInput
                  name="cantidad"
                  type="number"
                  min={1}
                  defaultValue="1"
                />
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
