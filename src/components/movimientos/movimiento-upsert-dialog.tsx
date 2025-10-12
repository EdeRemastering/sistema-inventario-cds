"use client";

import { useState, useEffect } from "react";
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
// Select components removidos - usando ElementoSearchSelect
import { GenericDateTimePicker } from "../ui/generic-date-picker";
import { SignaturePadComponent } from "../ui/signature-pad";
import { generateUniqueTicketNumber } from "../../lib/ticket-generator";
import { actionValidateStock } from "../../modules/movimientos/actions";
import {
  ElementoSearchSelect,
  ElementoOption,
} from "../ui/elemento-search-select";

const schema = z.object({
  elemento_id: z.number().int().positive("Selecciona elemento"),
  cantidad: z.number().int().positive("Cantidad requerida"),
  orden_numero: z.string().optional(),
  fecha_movimiento: z.date({
    message: "Fecha de movimiento requerida",
  }),
  hora_movimiento: z.string().optional(),
  dependencia_entrega: z.string().min(1, "Requerido"),
  firma_funcionario_entrega: z.string().optional(),
  cargo_funcionario_entrega: z.string().optional(),
  dependencia_recibe: z.string().min(1, "Requerido"),
  firma_funcionario_recibe: z.string().optional(),
  cargo_funcionario_recibe: z.string().optional(),
  motivo: z.string().optional(),
  fecha_estimada_devolucion: z.date({
    message: "Fecha estimada de devolución requerida",
  }),
  numero_ticket: z.string().optional(),
  observaciones_entrega: z.string().optional(),
});

type MovimientoFormData = z.infer<typeof schema>;

// Usar el tipo ElementoOption del componente reutilizable

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  create?: boolean;
  elementos: ElementoOption[];
  defaultValues?: Partial<MovimientoFormData> & {
    firma_entrega?: string | null;
    firma_recibe?: string | null;
  };
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
  const [firmaEntrega, setFirmaEntrega] = useState<string | null>(null);
  const [firmaRecibe, setFirmaRecibe] = useState<string | null>(null);
  const [horaDevolucion, setHoraDevolucion] = useState<string>("");
  const [fechaMovimiento, setFechaMovimiento] = useState<Date | undefined>();
  const [fechaDevolucion, setFechaDevolucion] = useState<Date | undefined>();
  const [stockInfo, setStockInfo] = useState<{
    available: number;
    total: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MovimientoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cantidad: 1,
      fecha_movimiento: new Date(),
      fecha_estimada_devolucion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde hoy
      ...defaultValues,
    } as MovimientoFormData,
  });

  const selectedElementoId = watch("elemento_id");
  const cantidad = watch("cantidad");

  // Generar número de ticket automáticamente al crear
  useEffect(() => {
    if (create && open && !defaultValues?.numero_ticket) {
      generateUniqueTicketNumber().then((ticketNumber) => {
        setValue("numero_ticket", ticketNumber);
      });
    }
  }, [create, open, defaultValues?.numero_ticket, setValue]);

  // Inicializar valores por defecto cuando se abre el diálogo
  useEffect(() => {
    if (open && defaultValues) {
      // Inicializar fechas
      if (defaultValues.fecha_movimiento) {
        setFechaMovimiento(new Date(defaultValues.fecha_movimiento));
      }
      if (defaultValues.fecha_estimada_devolucion) {
        setFechaDevolucion(new Date(defaultValues.fecha_estimada_devolucion));
      }
      // Inicializar firmas
      if (defaultValues.firma_funcionario_entrega) {
        setFirmaEntrega(defaultValues.firma_funcionario_entrega);
      }
      if (defaultValues.firma_funcionario_recibe) {
        setFirmaRecibe(defaultValues.firma_funcionario_recibe);
      }
    }
  }, [open, defaultValues]);

  // Sincronizar fechas del formulario con el estado local
  useEffect(() => {
    const fechaMov = watch("fecha_movimiento");
    const fechaDev = watch("fecha_estimada_devolucion");
    if (fechaMov) setFechaMovimiento(fechaMov);
    if (fechaDev) setFechaDevolucion(fechaDev);
  }, [watch]);

  // Validar stock cuando cambie el elemento o cantidad
  useEffect(() => {
    if (selectedElementoId && cantidad) {
      const elementoId = selectedElementoId;
      const cantidadNum = cantidad;

      // Solo validar si los valores son válidos
      if (
        isNaN(elementoId) ||
        isNaN(cantidadNum) ||
        elementoId <= 0 ||
        cantidadNum <= 0
      ) {
        setStockInfo(null);
        return;
      }

      actionValidateStock(Number(elementoId), cantidadNum)
        .then((result) => {
          if (result.isValid) {
            setStockInfo({
              available: result.availableQuantity,
              total: result.availableQuantity + cantidadNum,
            });
          } else {
            setStockInfo(null);
            // Solo mostrar toast si el error no es de validación básica
            if (
              !result.message?.includes("inválido") &&
              !result.message?.includes("no encontrado")
            ) {
              toast.error(result.message || "Stock insuficiente");
            }
          }
        })
        .catch((error) => {
          console.error("Error validando stock:", error);
          setStockInfo(null);
          // No mostrar toast de error para evitar spam
        });
    } else {
      setStockInfo(null);
    }
  }, [selectedElementoId, cantidad]);

  const onSubmit = async (data: MovimientoFormData) => {
    try {
      // Validar stock antes de enviar
      if (selectedElementoId && cantidad) {
        const elementoId = selectedElementoId;
        const cantidadNum = cantidad;

        if (
          !isNaN(elementoId) &&
          !isNaN(cantidadNum) &&
          elementoId > 0 &&
          cantidadNum > 0
        ) {
          const stockValidation = await actionValidateStock(
            Number(elementoId),
            cantidadNum
          );
          if (!stockValidation.isValid) {
            toast.error(stockValidation.message || "Stock insuficiente");
            return;
          }
        }
      }

      const formData = new FormData();

      // Combinar fecha y hora para fecha_movimiento
      let fechaMovimientoCompleta = data.fecha_movimiento;
      if (data.hora_movimiento) {
        const [hours, minutes] = data.hora_movimiento.split(":");
        fechaMovimientoCompleta = new Date(data.fecha_movimiento);
        fechaMovimientoCompleta.setHours(parseInt(hours), parseInt(minutes));
      }

      // Agregar todos los campos del formulario
      formData.append("elemento_id", data.elemento_id.toString());
      formData.append("cantidad", data.cantidad.toString());
      if (data.orden_numero) formData.append("orden_numero", data.orden_numero);
      formData.append(
        "fecha_movimiento",
        fechaMovimientoCompleta.toISOString()
      );
      formData.append("dependencia_entrega", data.dependencia_entrega);
      if (data.cargo_funcionario_entrega)
        formData.append(
          "cargo_funcionario_entrega",
          data.cargo_funcionario_entrega
        );
      formData.append("dependencia_recibe", data.dependencia_recibe);
      if (data.cargo_funcionario_recibe)
        formData.append(
          "cargo_funcionario_recibe",
          data.cargo_funcionario_recibe
        );
      if (data.motivo) formData.append("motivo", data.motivo);
      formData.append(
        "fecha_estimada_devolucion",
        data.fecha_estimada_devolucion.toISOString()
      );
      if (data.numero_ticket)
        formData.append("numero_ticket", data.numero_ticket);
      if (data.observaciones_entrega)
        formData.append("observaciones_entrega", data.observaciones_entrega);

      // Agregar firmas digitales
      if (firmaEntrega) formData.append("firma_entrega", firmaEntrega);
      if (firmaRecibe) formData.append("firma_recibe", firmaRecibe);

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
      setFirmaEntrega(null);
      setFirmaRecibe(null);
      setFechaMovimiento(undefined);
      setFechaDevolucion(undefined);
      setStockInfo(null);
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
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Elemento */}
            <ElementoSearchSelect
              elementos={elementos}
              value={watch("elemento_id")}
              onValueChange={(value) => setValue("elemento_id", value || 0)}
              placeholder="Seleccionar elemento"
              label="Elemento"
              error={errors.elemento_id?.message}
              required
            />

            {/* Cantidad y Orden */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  {...register("cantidad", { valueAsNumber: true })}
                />
                {errors.cantidad && (
                  <p className="text-red-500 text-sm">
                    {errors.cantidad.message}
                  </p>
                )}
                {stockInfo && (
                  <p className="text-xs text-muted-foreground">
                    Stock disponible: {stockInfo.available} unidades
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
            <div className="flex flex-col gap-4">
              <GenericDateTimePicker
                label="Fecha de Movimiento"
                value={fechaMovimiento}
                onChange={(date) => {
                  if (date) {
                    setFechaMovimiento(date);
                    setValue("fecha_movimiento", date);
                  }
                }}
                placeholder="Seleccionar fecha y hora"
                error={errors.fecha_movimiento?.message}
                required
                timeValue={watch("hora_movimiento") || ""}
                onTimeChange={(time) => setValue("hora_movimiento", time)}
              />

              <GenericDateTimePicker
                label="Fecha Estimada de Devolución"
                value={fechaDevolucion}
                onChange={(date) => {
                  if (date) {
                    // Combinar fecha con hora si existe
                    if (horaDevolucion) {
                      const [hours, minutes] = horaDevolucion.split(":");
                      date.setHours(parseInt(hours), parseInt(minutes));
                    }
                    setFechaDevolucion(date);
                    setValue("fecha_estimada_devolucion", date);
                  }
                }}
                placeholder="Seleccionar fecha y hora"
                error={errors.fecha_estimada_devolucion?.message}
                required
                timeValue={horaDevolucion}
                onTimeChange={setHoraDevolucion}
              />
            </div>

            {/* Dependencias */}
            <div className="grid grid-cols-2 gap-4">
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
              <div className="grid gap-1">
                <Label htmlFor="dependencia_recibe">
                  Dependencia que Recibe
                </Label>
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
