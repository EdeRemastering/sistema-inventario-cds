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
import { GenericDateTimePicker } from "../ui/generic-date-picker";
import { SignaturePadComponent } from "../ui/signature-pad";

const schema = z.object({
  numero_ticket: z.string().min(1, "Número requerido"),
  fecha_salida: z.date({
    message: "Fecha de salida requerida",
  }),
  fecha_estimada_devolucion: z.date().optional(),
  elemento: z.string().optional(),
  serie: z.string().optional(),
  marca_modelo: z.string().optional(),
  cantidad: z.string().min(1, "Cantidad requerida"),
  dependencia_entrega: z.string().optional(),
  firma_funcionario_entrega: z.string().optional(),
  dependencia_recibe: z.string().optional(),
  firma_funcionario_recibe: z.string().optional(),
  motivo: z.string().optional(),
  orden_numero: z.string().optional(),
});

type TicketFormData = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<TicketFormData>;
  hiddenFields?: Record<string, string | number>;
  trigger?: React.ReactNode;
};

export function TicketUpsertDialog({
  serverAction,
  create = true,
  defaultValues,
  hiddenFields,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [firmaEntrega, setFirmaEntrega] = useState<string | null>(null);
  const [firmaRecibe, setFirmaRecibe] = useState<string | null>(null);
  const [horaSalida, setHoraSalida] = useState<string>("");
  const [horaDevolucion, setHoraDevolucion] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cantidad: "1",
      ...defaultValues,
    } as TicketFormData,
  });

  const onSubmit = async (data: TicketFormData) => {
    try {
      const formData = new FormData();

      // Agregar todos los campos del formulario
      formData.append("numero_ticket", data.numero_ticket);
      formData.append("fecha_salida", data.fecha_salida.toISOString());
      if (data.fecha_estimada_devolucion)
        formData.append(
          "fecha_estimada_devolucion",
          data.fecha_estimada_devolucion.toISOString()
        );
      if (data.elemento) formData.append("elemento", data.elemento);
      if (data.serie) formData.append("serie", data.serie);
      if (data.marca_modelo) formData.append("marca_modelo", data.marca_modelo);
      formData.append("cantidad", data.cantidad);
      if (data.dependencia_entrega)
        formData.append("dependencia_entrega", data.dependencia_entrega);
      if (data.dependencia_recibe)
        formData.append("dependencia_recibe", data.dependencia_recibe);
      if (data.motivo) formData.append("motivo", data.motivo);
      if (data.orden_numero) formData.append("orden_numero", data.orden_numero);

      // Agregar firmas digitales
      if (firmaEntrega)
        formData.append("firma_funcionario_entrega", firmaEntrega);
      if (firmaRecibe) formData.append("firma_funcionario_recibe", firmaRecibe);

      // Agregar campos ocultos
      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando ticket..." : "Actualizando ticket...",
        success: create
          ? "Ticket creado exitosamente"
          : "Ticket actualizado exitosamente",
        error: "Error al procesar el formulario",
      });

      reset();
      setFirmaEntrega(null);
      setFirmaRecibe(null);
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const btnText = create ? "Crear" : "Editar";
  const title = create ? "Crear ticket" : "Editar ticket";
  const submitText = create ? "Crear" : "Guardar cambios";

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)}>{btnText}</Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Número de Ticket */}
            <div className="grid gap-1">
              <Label htmlFor="numero_ticket">Número de Ticket</Label>
              <Input
                id="numero_ticket"
                type="text"
                placeholder="Ej: TICK-001"
                {...register("numero_ticket")}
              />
              {errors.numero_ticket && (
                <p className="text-red-500 text-sm">
                  {errors.numero_ticket.message}
                </p>
              )}
            </div>

            {/* Fechas */}
            <div className="flex flex-col gap-4">
              <GenericDateTimePicker
                label="Fecha de Salida"
                value={watch("fecha_salida")}
                onChange={(date) => {
                  if (date) {
                    // Combinar fecha con hora si existe
                    if (horaSalida) {
                      const [hours, minutes] = horaSalida.split(':');
                      date.setHours(parseInt(hours), parseInt(minutes));
                    }
                    setValue("fecha_salida", date);
                  }
                }}
                placeholder="Seleccionar fecha y hora"
                error={errors.fecha_salida?.message}
                required
                timeValue={horaSalida}
                onTimeChange={setHoraSalida}
              />
              <GenericDateTimePicker
                label="Fecha Estimada de Devolución"
                value={watch("fecha_estimada_devolucion")}
                onChange={(date) => {
                  if (date) {
                    // Combinar fecha con hora si existe
                    if (horaDevolucion) {
                      const [hours, minutes] = horaDevolucion.split(':');
                      date.setHours(parseInt(hours), parseInt(minutes));
                    }
                    setValue("fecha_estimada_devolucion", date);
                  }
                }}
                placeholder="Seleccionar fecha y hora"
                error={errors.fecha_estimada_devolucion?.message}
                timeValue={horaDevolucion}
                onTimeChange={setHoraDevolucion}
              />
            </div>

            {/* Información del Elemento */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="elemento">Elemento</Label>
                <Input id="elemento" type="text" {...register("elemento")} />
                {errors.elemento && (
                  <p className="text-red-500 text-sm">
                    {errors.elemento.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="serie">Serie</Label>
                <Input id="serie" type="text" {...register("serie")} />
                {errors.serie && (
                  <p className="text-red-500 text-sm">{errors.serie.message}</p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="marca_modelo">Marca/Modelo</Label>
                <Input
                  id="marca_modelo"
                  type="text"
                  {...register("marca_modelo")}
                />
                {errors.marca_modelo && (
                  <p className="text-red-500 text-sm">
                    {errors.marca_modelo.message}
                  </p>
                )}
              </div>
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

            {/* Motivo */}
            <div className="grid gap-1">
              <Label htmlFor="motivo">Motivo</Label>
              <Input id="motivo" type="text" {...register("motivo")} />
              {errors.motivo && (
                <p className="text-red-500 text-sm">{errors.motivo.message}</p>
              )}
            </div>

            {/* Firmas Digitales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Firmas Digitales
              </h3>
              <div className="flex flex-col gap-8">
                <div className="space-y-2">
                  <SignaturePadComponent
                    label="Firma de Funcionario que Entrega"
                    onSignatureChange={setFirmaEntrega}
                    defaultValue={defaultValues?.firma_funcionario_entrega}
                    required={create}
                  />
                </div>

                <div className="space-y-2">
                  <SignaturePadComponent
                    label="Firma de Funcionario que Recibe"
                    onSignatureChange={setFirmaRecibe}
                    defaultValue={defaultValues?.firma_funcionario_recibe}
                    required={create}
                  />
                </div>
              </div>
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
