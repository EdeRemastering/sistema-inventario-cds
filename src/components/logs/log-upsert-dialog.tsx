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
  usuario_id: z.string().min(1, "Selecciona usuario"),
  accion: z.string().min(1, "Acción requerida"),
  descripcion: z.string().optional(),
});

type FormShape = z.infer<typeof schema>;

type UsuarioOption = { id: number; nombre: string };

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  usuarios: UsuarioOption[];
  defaultValues?: Partial<FormShape>;
  hiddenFields?: Record<string, string | number>;
};

export function LogUpsertDialog({
  serverAction,
  create = true,
  usuarios,
  defaultValues,
  hiddenFields,
}: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const form = useForm<FormShape>({
    resolver: zodResolver(schema),
    defaultValues: {
      usuario_id:
        defaultValues?.usuario_id ??
        (usuarios[0] ? String(usuarios[0].id) : ""),
      ...defaultValues,
    } as FormShape,
  });

  const onValid = () => formRef.current?.requestSubmit();
  const onInvalid = () => {};

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear log" : "Editar log";
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
                <label className="text-sm font-medium" htmlFor="usuario_id">
                  Usuario
                </label>
                <select
                  id="usuario_id"
                  name="usuario_id"
                  defaultValue={form.getValues("usuario_id")}
                  onChange={(e) =>
                    form.setValue("usuario_id", e.target.value, {
                      shouldValidate: true,
                    })
                  }
                  className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-primary/40 h-9 w-full min-w-0 rounded-md border-2 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] hover:border-primary/60"
                >
                  <option value="" disabled>
                    Selecciona usuario
                  </option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <FormField name="accion" label="Acción">
                <FormInput name="accion" />
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
