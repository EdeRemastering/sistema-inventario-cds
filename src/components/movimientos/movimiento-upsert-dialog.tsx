"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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

type MovimientoFormData = z.infer<typeof schema>;

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
  defaultValues?: Partial<MovimientoFormData>;
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MovimientoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cantidad: "1",
      ...defaultValues,
    } as MovimientoFormData,
  });

  const onSubmit = async (data: MovimientoFormData) => {
    try {
      const formData = new FormData();

      // Agregar todos los campos del formulario
      formData.append("elemento_id", data.elemento_id);
      formData.append("cantidad", data.cantidad);
      if (data.orden_numero) formData.append("orden_numero", data.orden_numero);
      formData.append("fecha_movimiento", data.fecha_movimiento);
      formData.append("dependencia_entrega", data.dependencia_entrega);
      formData.append("funcionario_entrega", data.funcionario_entrega);
      if (data.cargo_funcionario_entrega)
        formData.append(
          "cargo_funcionario_entrega",
          data.cargo_funcionario_entrega
        );
      formData.append("dependencia_recibe", data.dependencia_recibe);
      formData.append("funcionario_recibe", data.funcionario_recibe);
      if (data.cargo_funcionario_recibe)
        formData.append(
          "cargo_funcionario_recibe",
          data.cargo_funcionario_recibe
        );
      if (data.motivo) formData.append("motivo", data.motivo);
      formData.append(
        "fecha_estimada_devolucion",
        data.fecha_estimada_devolucion
      );
      if (data.numero_ticket)
        formData.append("numero_ticket", data.numero_ticket);
      if (data.observaciones_entrega)
        formData.append("observaciones_entrega", data.observaciones_entrega);

      // Agregar campos ocultos
      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create
          ? "Creando movimiento..."
          : "Actualizando movimiento...",
        success: create
          ? "Movimiento creado exitosamente"
          : "Movimiento actualizado exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear movimiento" : "Editar movimiento";
  const submitText = create ? "Crear" : "Guardar cambios";

  return (
    <>
      <Button onClick={() => setOpen(true)}>{btnText}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Elemento */}
            <div className="grid gap-1">
              <Label htmlFor="elemento_id">Elemento</Label>
              <select
                id="elemento_id"
                {...register("elemento_id")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  Selecciona elemento
                </option>
                {elementos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.serie} - {e.marca} {e.modelo}
                  </option>
                ))}
              </select>
              {errors.elemento_id && (
                <p className="text-red-500 text-sm">
                  {errors.elemento_id.message}
                </p>
              )}
            </div>

            {/* Cantidad y Orden */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  {...register("cantidad")}
                />
                {errors.cantidad && (
                  <p className="text-red-500 text-sm">
                    {errors.cantidad.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="orden_numero">Número de Orden</Label>
                <Input
                  id="orden_numero"
                  type="text"
                  {...register("orden_numero")}
                />
                {errors.orden_numero && (
                  <p className="text-red-500 text-sm">
                    {errors.orden_numero.message}
                  </p>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="fecha_movimiento">Fecha de Movimiento</Label>
                <Input
                  id="fecha_movimiento"
                  type="datetime-local"
                  {...register("fecha_movimiento")}
                />
                {errors.fecha_movimiento && (
                  <p className="text-red-500 text-sm">
                    {errors.fecha_movimiento.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="fecha_estimada_devolucion">
                  Fecha Estimada de Devolución
                </Label>
                <Input
                  id="fecha_estimada_devolucion"
                  type="date"
                  {...register("fecha_estimada_devolucion")}
                />
                {errors.fecha_estimada_devolucion && (
                  <p className="text-red-500 text-sm">
                    {errors.fecha_estimada_devolucion.message}
                  </p>
                )}
              </div>
            </div>

            {/* Dependencia de Entrega */}
            <div className="grid gap-1">
              <Label htmlFor="dependencia_entrega">
                Dependencia de Entrega
              </Label>
              <Input
                id="dependencia_entrega"
                type="text"
                {...register("dependencia_entrega")}
              />
              {errors.dependencia_entrega && (
                <p className="text-red-500 text-sm">
                  {errors.dependencia_entrega.message}
                </p>
              )}
            </div>

            {/* Funcionario de Entrega */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="funcionario_entrega">
                  Funcionario de Entrega
                </Label>
                <Input
                  id="funcionario_entrega"
                  type="text"
                  {...register("funcionario_entrega")}
                />
                {errors.funcionario_entrega && (
                  <p className="text-red-500 text-sm">
                    {errors.funcionario_entrega.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="cargo_funcionario_entrega">Cargo</Label>
                <Input
                  id="cargo_funcionario_entrega"
                  type="text"
                  {...register("cargo_funcionario_entrega")}
                />
                {errors.cargo_funcionario_entrega && (
                  <p className="text-red-500 text-sm">
                    {errors.cargo_funcionario_entrega.message}
                  </p>
                )}
              </div>
            </div>

            {/* Dependencia que Recibe */}
            <div className="grid gap-1">
              <Label htmlFor="dependencia_recibe">Dependencia que Recibe</Label>
              <Input
                id="dependencia_recibe"
                type="text"
                {...register("dependencia_recibe")}
              />
              {errors.dependencia_recibe && (
                <p className="text-red-500 text-sm">
                  {errors.dependencia_recibe.message}
                </p>
              )}
            </div>

            {/* Funcionario que Recibe */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="funcionario_recibe">
                  Funcionario que Recibe
                </Label>
                <Input
                  id="funcionario_recibe"
                  type="text"
                  {...register("funcionario_recibe")}
                />
                {errors.funcionario_recibe && (
                  <p className="text-red-500 text-sm">
                    {errors.funcionario_recibe.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="cargo_funcionario_recibe">Cargo</Label>
                <Input
                  id="cargo_funcionario_recibe"
                  type="text"
                  {...register("cargo_funcionario_recibe")}
                />
                {errors.cargo_funcionario_recibe && (
                  <p className="text-red-500 text-sm">
                    {errors.cargo_funcionario_recibe.message}
                  </p>
                )}
              </div>
            </div>

            {/* Motivo y Número de Ticket */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="motivo">Motivo</Label>
                <Input id="motivo" type="text" {...register("motivo")} />
                {errors.motivo && (
                  <p className="text-red-500 text-sm">
                    {errors.motivo.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="numero_ticket">Número de Ticket</Label>
                <Input
                  id="numero_ticket"
                  type="text"
                  {...register("numero_ticket")}
                />
                {errors.numero_ticket && (
                  <p className="text-red-500 text-sm">
                    {errors.numero_ticket.message}
                  </p>
                )}
              </div>
            </div>

            {/* Observaciones */}
            <div className="grid gap-1">
              <Label htmlFor="observaciones_entrega">
                Observaciones de Entrega
              </Label>
              <textarea
                id="observaciones_entrega"
                rows={3}
                {...register("observaciones_entrega")}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.observaciones_entrega && (
                <p className="text-red-500 text-sm">
                  {errors.observaciones_entrega.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {submitText}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
