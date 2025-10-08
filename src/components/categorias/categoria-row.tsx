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
import { DeleteButton } from "../delete-button";
import { toast } from "sonner";

const categoriaUpdateSchema = z.object({
  id: z.number(),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().optional(),
  estado: z.enum(["activo", "inactivo"]),
});

type CategoriaUpdateData = z.infer<typeof categoriaUpdateSchema>;

type CategoriaRowProps = {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  onUpdate: (data: CategoriaUpdateData) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function CategoriaRow({
  id,
  nombre,
  descripcion,
  estado,
  onUpdate,
  onDelete,
}: CategoriaRowProps) {
  const form = useForm<CategoriaUpdateData>({
    resolver: zodResolver(categoriaUpdateSchema),
    defaultValues: {
      id,
      nombre,
      descripcion,
      estado: estado as "activo" | "inactivo",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await onUpdate(data);
      toast.success("Categoría actualizada exitosamente");
    } catch (error) {
      toast.error("Error al actualizar la categoría");
    }
  });

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 rounded border p-3"
      >
        <FormField name="nombre" className="w-48">
          <FormInput name="nombre" />
        </FormField>

        <FormField name="descripcion" className="flex-1">
          <FormTextarea name="descripcion" rows={1} />
        </FormField>

        <FormField name="estado">
          <FormSwitch name="estado" label="Activo" />
        </FormField>

        <div className="ml-auto flex gap-2">
          <Button
            type="submit"
            variant="default"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          <DeleteButton onConfirm={onDelete}>Eliminar</DeleteButton>
        </div>
      </form>
    </Form>
  );
}
