"use client";

import React, { useState } from "react";
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
import { ElementosTicketForm } from "./elementos-ticket-form";
import { ElementoFormData } from "@/modules/tickets_guardados/types";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { GenericDateTimePicker } from "../ui/generic-date-picker";
import { SignaturePadComponent } from "../ui/signature-pad";
import { actionListElementos } from "@/modules/elementos/actions";

const schema = z
  .object({
    numero_ticket: z.string().optional(), // Ahora es opcional, se generará automáticamente
    fecha_salida: z.date({
      message: "Fecha de salida requerida",
    }),
    fecha_estimada_devolucion: z.date().optional(),
    dependencia_entrega: z.string().optional(),
    persona_entrega_nombre: z.string().optional(),
    persona_entrega_apellido: z.string().optional(),
    firma_funcionario_entrega: z.string().optional(),
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
  const [elementos, setElementos] = useState<
    {
      id: number;
      serie: string;
      marca?: string | null;
      modelo?: string | null;
      categoria: {
        nombre: string;
      };
      subcategoria?: {
        nombre: string;
      } | null;
    }[]
  >([]);
  const [elementosSeleccionados, setElementosSeleccionados] = useState<
    ElementoFormData[]
  >([]);
  const [firmaEntrega, setFirmaEntrega] = useState<string | null>(null);
  const [firmaRecibe, setFirmaRecibe] = useState<string | null>(null);
  const [horaSalida, setHoraSalida] = useState<string>("");
  const [horaDevolucion, setHoraDevolucion] = useState<string>("");

  // Obtener elementos cuando se abre el diálogo
  React.useEffect(() => {
    const fetchElementos = async () => {
      try {
        const elementosData = await actionListElementos();
        setElementos(elementosData || []);
      } catch (error) {
        console.error("Error fetching elementos:", error);
      }
    };

    if (open) {
      fetchElementos();
    }
  }, [open]);

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
      ...defaultValues,
    } as TicketFormData,
  });

  const onSubmit = async (data: TicketFormData) => {
    try {
      // Validar que hay al menos un elemento
      if (elementosSeleccionados.length === 0) {
        toast.error("Debe agregar al menos un elemento al ticket");
        return;
      }

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
      if (data.dependencia_entrega)
        formData.append("dependencia_entrega", data.dependencia_entrega);
      if (data.persona_entrega_nombre)
        formData.append("persona_entrega_nombre", data.persona_entrega_nombre);
      if (data.persona_entrega_apellido)
        formData.append(
          "persona_entrega_apellido",
          data.persona_entrega_apellido
        );
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
      if (firmaEntrega)
        formData.append("firma_funcionario_entrega", firmaEntrega);
      if (firmaRecibe) formData.append("firma_funcionario_recibe", firmaRecibe);

      // Agregar elementos seleccionados
      formData.append("elementos", JSON.stringify(elementosSeleccionados));

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
      setElementosSeleccionados([]);
      setFirmaEntrega(null);
      setFirmaRecibe(null);
      setHoraSalida("");
      setHoraDevolucion("");
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

            {/* Fechas */}
            <div className="flex flex-col gap-4">
              <GenericDateTimePicker
                label="Fecha de Salida"
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
                      const [hours, minutes] = horaDevolucion.split(":");
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

            {/* Selección de Múltiples Elementos */}
            <ElementosTicketForm
              elementos={elementos}
              elementosSeleccionados={elementosSeleccionados}
              onElementosChange={setElementosSeleccionados}
            />

            {/* Número de Orden */}
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

            {/* Persona que Entrega */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="persona_entrega_nombre">
                  Nombre (Quien Entrega)
                </Label>
                <Input
                  id="persona_entrega_nombre"
                  type="text"
                  {...register("persona_entrega_nombre")}
                />
                {errors.persona_entrega_nombre && (
                  <p className="text-red-500 text-sm">
                    {errors.persona_entrega_nombre.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="persona_entrega_apellido">
                  Apellido (Quien Entrega)
                </Label>
                <Input
                  id="persona_entrega_apellido"
                  type="text"
                  {...register("persona_entrega_apellido")}
                />
                {errors.persona_entrega_apellido && (
                  <p className="text-red-500 text-sm">
                    {errors.persona_entrega_apellido.message}
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

            {/* Persona que Recibe */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="persona_recibe_nombre">
                  Nombre (Quien Recibe)
                </Label>
                <Input
                  id="persona_recibe_nombre"
                  type="text"
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
                  Apellido (Quien Recibe)
                </Label>
                <Input
                  id="persona_recibe_apellido"
                  type="text"
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
