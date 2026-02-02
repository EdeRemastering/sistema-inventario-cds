"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { Ubicacion } from "@/modules/ubicaciones/types";

const schema = z
  .object({
    numero_ticket: z.string().optional(), // Ahora es opcional, se generará automáticamente
    fecha_salida: z.date({
      message: "Fecha de inicio requerida",
    }),
    fecha_estimada_devolucion: z.date().optional(),
    ubicacion_id: z.string().min(1, "Selecciona una ubicación"),
    dependencia_recibe: z.string().optional(),
    persona_recibe_nombre: z.string().optional(),
    persona_recibe_apellido: z.string().optional(),
    firma_funcionario_recibe: z.string().optional(),
    motivo: z.string().optional(),
    orden_numero: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validar que las fechas sean válidas
      if (data.fecha_salida && isNaN(data.fecha_salida.getTime())) {
        return false;
      }
      if (
        data.fecha_estimada_devolucion &&
        isNaN(data.fecha_estimada_devolucion.getTime())
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Fecha inválida",
      path: ["fecha_salida"],
    }
  );

type TicketFormData = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  ubicaciones: Ubicacion[];
  defaultValues?: Partial<TicketFormData>;
  hiddenFields?: Record<string, string | number>;
  trigger?: React.ReactNode;
};

export function TicketUpsertDialog({
  serverAction,
  create = true,
  ubicaciones,
  defaultValues,
  hiddenFields,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [firmaRecibe, setFirmaRecibe] = useState<string | null>(null);
  const [horaSalida, setHoraSalida] = useState<string>("");
  const [horaDevolucion, setHoraDevolucion] = useState<string>("");
  const { data: session } = useSession();

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
      ubicacion_id: "",
      ...defaultValues,
    } as TicketFormData,
  });

  const onSubmit = async (data: TicketFormData) => {
    try {
      const formData = new FormData();

      // Agregar todos los campos del formulario
      if (data.numero_ticket) {
        formData.append("numero_ticket", data.numero_ticket);
      }
      formData.append("fecha_salida", data.fecha_salida.toISOString());
      if (data.fecha_estimada_devolucion)
        formData.append(
          "fecha_estimada_devolucion",
          data.fecha_estimada_devolucion.toISOString()
        );
      formData.append("ubicacion_id", data.ubicacion_id);
      if (data.dependencia_recibe)
        formData.append("dependencia_recibe", data.dependencia_recibe);
      if (data.persona_recibe_nombre)
        formData.append("persona_recibe_nombre", data.persona_recibe_nombre);
      if (data.persona_recibe_apellido)
        formData.append(
          "persona_recibe_apellido",
          data.persona_recibe_apellido
        );
      if (data.motivo) formData.append("motivo", data.motivo);
      if (data.orden_numero) formData.append("orden_numero", data.orden_numero);

      // Agregar firmas digitales
      if (firmaRecibe) formData.append("firma_funcionario_recibe", firmaRecibe);

      // Agregar campos ocultos
      if (hiddenFields) {
        Object.entries(hiddenFields).forEach(([name, value]) => {
          formData.append(name, String(value));
        });
      }

      console.log("Enviando formulario de ticket...");
      const promise = serverAction(formData);

      await toast.promise(promise, {
        loading: create ? "Creando ticket..." : "Actualizando ticket...",
        success: create
          ? "Ticket creado exitosamente"
          : "Ticket actualizado exitosamente",
        error: (err) => {
          const errorMessage = err instanceof Error ? err.message : "Error al procesar el formulario";
          console.error("Error detallado en onSubmit:", err);
          return errorMessage;
        },
      });

      reset();
      setFirmaRecibe(null);
      setHoraSalida("");
      setHoraDevolucion("");
      setOpen(false);
    } catch (error) {
      console.error("Error capturado en onSubmit:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Error desconocido al procesar el ticket";
      toast.error(errorMessage, {
        duration: 5000,
        description: "Por favor, verifica los datos e intenta nuevamente."
      });
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-tour="ticket-form">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Número de Ticket - Solo mostrar al editar */}
            {!create && (
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
            )}

            {/* Información para tickets nuevos */}
            {create && (
              <div className="grid gap-1">
                <Label>Información del Ticket</Label>
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  <p className="font-medium">
                    El número de ticket se generará automáticamente
                  </p>
                  <p className="text-xs mt-1">
                    Se creará un número único siguiendo el formato:
                    TICKET-YYYY-NNNNNN
                  </p>
                </div>
              </div>
            )}

            {/* Quien resuelve (auto) */}
            <div className="grid gap-1">
              <Label>Resuelve la solicitud</Label>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <p className="font-medium">
                  {session?.user?.name ?? "Usuario autenticado"}
                </p>
                <p className="text-xs mt-1">
                  Se tomará automáticamente del usuario que inició sesión (firma incluida).
                </p>
              </div>
            </div>

            {/* Fechas */}
            <div className="flex flex-col gap-4" data-tour="ticket-form-fechas">
              <div data-tour="ticket-form-fecha-inicio">
                <GenericDateTimePicker
                  label="Fecha de inicio"
                  value={watch("fecha_salida")}
                  onChange={(date) => {
                    if (date) {
                      // Combinar fecha con hora si existe
                      if (horaSalida) {
                        const [hours, minutes] = horaSalida.split(":");
                        date.setHours(parseInt(hours), parseInt(minutes));
                      }
                      setValue("fecha_salida", date);
                    }
                  }}
                  placeholder="Ej: hoy 08:00"
                  error={errors.fecha_salida?.message}
                  required
                  timeValue={horaSalida}
                  onTimeChange={setHoraSalida}
                />
              </div>
              <div data-tour="ticket-form-fecha-devolucion">
                <GenericDateTimePicker
                  label="Fecha Estimada de Devolución"
                  value={watch("fecha_estimada_devolucion")}
                  onChange={(date) => {
                    if (date) {
                      // Combinar fecha con hora si existe
                      if (horaDevolucion) {
                        const [hours, minutes] = horaDevolucion.split(":");
                        date.setHours(parseInt(hours), parseInt(minutes));
                      }
                      setValue("fecha_estimada_devolucion", date);
                    }
                  }}
                  placeholder="Ej: hoy 17:00"
                  error={errors.fecha_estimada_devolucion?.message}
                  timeValue={horaDevolucion}
                  onTimeChange={setHoraDevolucion}
                />
              </div>
            </div>

            {/* Ubicación prestada */}
            <div className="grid gap-1" data-tour="ticket-form-ubicacion">
              <Label>Ubicación (Ambiente) a prestar</Label>
              <Select
                value={watch("ubicacion_id")}
                onValueChange={(v) => setValue("ubicacion_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ej: SAL-02 - Sala de Sistemas 2" />
                </SelectTrigger>
                <SelectContent>
                  {ubicaciones.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.codigo} - {u.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ubicacion_id && (
                <p className="text-red-500 text-sm">{errors.ubicacion_id.message}</p>
              )}
            </div>

            {/* Número de Orden */}
            <div className="grid gap-1">
              <Label htmlFor="orden_numero">Número de Orden</Label>
              <Input
                id="orden_numero"
                type="text"
                placeholder="Ej: OT-2026-00123"
                {...register("orden_numero")}
              />
              {errors.orden_numero && (
                <p className="text-red-500 text-sm">
                  {errors.orden_numero.message}
                </p>
              )}
            </div>

            {/* Dependencia del solicitante */}
            <div className="grid gap-1">
              <Label htmlFor="dependencia_recibe">Dependencia del solicitante</Label>
              <Input
                id="dependencia_recibe"
                type="text"
                placeholder="Ej: Coordinación Académica / Sistemas / Logística"
                {...register("dependencia_recibe")}
              />
              {errors.dependencia_recibe && (
                <p className="text-red-500 text-sm">
                  {errors.dependencia_recibe.message}
                </p>
              )}
            </div>

            {/* Solicitante */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="persona_recibe_nombre">
                  Nombre (Solicitante)
                </Label>
                <Input
                  id="persona_recibe_nombre"
                  type="text"
                  placeholder="Ej: Luisa"
                  {...register("persona_recibe_nombre")}
                />
                {errors.persona_recibe_nombre && (
                  <p className="text-red-500 text-sm">
                    {errors.persona_recibe_nombre.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="persona_recibe_apellido">
                  Apellido (Solicitante)
                </Label>
                <Input
                  id="persona_recibe_apellido"
                  type="text"
                  placeholder="Ej: Pérez"
                  {...register("persona_recibe_apellido")}
                />
                {errors.persona_recibe_apellido && (
                  <p className="text-red-500 text-sm">
                    {errors.persona_recibe_apellido.message}
                  </p>
                )}
              </div>
            </div>

            {/* Motivo */}
            <div className="grid gap-1">
              <Label htmlFor="motivo">Motivo</Label>
              <Input
                id="motivo"
                type="text"
                placeholder="Ej: Clase de capacitación / Evento institucional"
                {...register("motivo")}
              />
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
                    label="Firma del solicitante"
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
              <Button type="submit" disabled={isSubmitting} data-tour="ticket-form-submit">
                {submitText}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
