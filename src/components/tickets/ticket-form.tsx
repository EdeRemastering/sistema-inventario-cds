"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { GenericDateTimePicker } from "../ui/generic-date-picker";
import { SignaturePadComponent } from "../ui/signature-pad";
// Select components removidos - usando ElementoSearchSelect
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Plus, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import {
  ElementoSearchSelect,
  ElementoOption,
} from "../ui/elemento-search-select";

const elementoSchema = z.object({
  elemento_id: z.number().int().positive("Elemento requerido"),
  cantidad: z.number().int().positive("Cantidad debe ser mayor a 0"),
});

const ticketFormSchema = z.object({
  numero_ticket: z.string().optional(),
  orden_numero: z.string().min(1, "Número de orden requerido"),
  fecha_movimiento: z.date({
    message: "Fecha de movimiento requerida",
  }),
  dependencia_entrega: z.string().min(1, "Dependencia de entrega requerida"),
  cargo_funcionario_entrega: z.string().optional(),
  dependencia_recibe: z.string().min(1, "Dependencia que recibe requerida"),
  cargo_funcionario_recibe: z.string().optional(),
  motivo: z.string().min(1, "Motivo requerido"),
  fecha_estimada_devolucion: z.date({
    message: "Fecha estimada de devolución requerida",
  }),
  fecha_real_devolucion: z.date().optional(),
  observaciones_entrega: z.string().optional(),
  observaciones_devolucion: z.string().optional(),
  firma_recepcion: z.string().optional(),
  tipo: z.enum(["SALIDA", "DEVOLUCION"]),
  firma_entrega: z.string().optional(),
  firma_recibe: z.string().optional(),
  hora_entrega: z.date().optional(),
  hora_devolucion: z.date().optional(),
  firma_devuelve: z.string().optional(),
  firma_recibe_devolucion: z.string().optional(),
  devuelto_por: z.string().optional(),
  recibido_por: z.string().optional(),
  elementos: z
    .array(elementoSchema)
    .min(1, "Debe seleccionar al menos un elemento"),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

type Elemento = ElementoOption;

type Props = {
  onSubmit: (
    data: TicketFormData & { firmas: { entrega?: string; recibe?: string } }
  ) => Promise<void>;
  create?: boolean;
  defaultValues?: Partial<TicketFormData>;
  hiddenFields?: Record<string, string | number>;
  elementos?: Elemento[];
  isLoading?: boolean;
};

export function TicketForm({
  onSubmit,
  create = true,
  defaultValues,
  hiddenFields,
  elementos = [],
  isLoading = false,
}: Props) {
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      tipo: "SALIDA",
      elementos: [{ elemento_id: 0, cantidad: 1 }],
      ...defaultValues,
    } as TicketFormData,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "elementos",
  });

  const onSubmitForm = async (data: TicketFormData) => {
    try {
      await onSubmit({
        ...data,
        firmas: {
          entrega: firmaEntrega || undefined,
          recibe: firmaRecibe || undefined,
        },
      });

      reset();
      setFirmaEntrega(null);
      setFirmaRecibe(null);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addElemento = () => {
    append({ elemento_id: 0, cantidad: 1 });
  };

  const removeElemento = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("Debe tener al menos un elemento");
    }
  };

  const getElementoInfo = (elementoId: number) => {
    return elementos.find((e) => e.id === elementoId);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        {/* Información del Ticket */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">📋</span>
              </div>
              Información del Ticket
            </CardTitle>
            <CardDescription className="text-sm">
              {create
                ? "Crear un nuevo ticket de préstamo"
                : "Editar ticket existente"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                value={watch("fecha_movimiento")}
                onChange={(date) => {
                  if (date) {
                    if (horaSalida) {
                      const [hours, minutes] = horaSalida.split(":");
                      date.setHours(parseInt(hours), parseInt(minutes));
                    }
                    setValue("fecha_movimiento", date);
                  }
                }}
                placeholder="Seleccionar fecha y hora"
                error={errors.fecha_movimiento?.message}
                required
                timeValue={horaSalida}
                onTimeChange={setHoraSalida}
              />
              <GenericDateTimePicker
                label="Fecha Estimada de Devolución"
                value={watch("fecha_estimada_devolucion")}
                onChange={(date) => {
                  if (date) {
                    if (horaDevolucion) {
                      const [hours, minutes] = horaDevolucion.split(":");
                      date.setHours(parseInt(hours), parseInt(minutes));
                    }
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

            {/* Cargos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="cargo_funcionario_entrega">
                  Cargo Funcionario Entrega
                </Label>
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
              <div className="grid gap-1">
                <Label htmlFor="cargo_funcionario_recibe">
                  Cargo Funcionario Recibe
                </Label>
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

            {/* Motivo y Orden */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          </CardContent>
        </Card>

        {/* Elementos */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              Elementos del Ticket
            </CardTitle>
            <CardDescription className="text-sm">
              Seleccione los elementos que se incluirán en este ticket
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => {
              const elementoInfo = getElementoInfo(
                watch(`elementos.${index}.elemento_id`)
              );

              return (
                <div
                  key={field.id}
                  className="border border-border/50 rounded-xl p-5 space-y-5 bg-gradient-to-br from-background to-muted/20 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <h4 className="font-semibold text-lg">
                        Elemento {index + 1}
                      </h4>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeElemento(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <ElementoSearchSelect
                        elementos={elementos}
                        value={watch(`elementos.${index}.elemento_id`)}
                        onValueChange={(value) => {
                          setValue(
                            `elementos.${index}.elemento_id`,
                            value || 0
                          );
                        }}
                        placeholder="Seleccionar elemento"
                        label="Elemento"
                        error={errors.elementos?.[index]?.elemento_id?.message}
                        required
                      />
                    </div>

                    <div className="grid gap-1 w-32">
                      <Label htmlFor={`elementos.${index}.cantidad`}>
                        Cantidad
                      </Label>
                      <Input
                        id={`elementos.${index}.cantidad`}
                        type="number"
                        min="1"
                        {...register(`elementos.${index}.cantidad`, {
                          valueAsNumber: true,
                        })}
                      />
                      {errors.elementos?.[index]?.cantidad && (
                        <p className="text-red-500 text-sm">
                          {errors.elementos[index]?.cantidad?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {elementoInfo && (
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 p-5 rounded-xl mt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <h5 className="font-semibold text-sm text-primary">
                          Información del Elemento Seleccionado
                        </h5>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="bg-white/50 rounded-lg p-2 basis-[32%] box-border">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Serie
                          </span>
                          <p className="font-semibold text-sm mt-1">
                            {elementoInfo.serie}
                          </p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3 basis-[31.6%] box-border">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Marca
                          </span>
                          <p className="font-semibold text-sm mt-1">
                            {elementoInfo.marca || "N/A"}
                          </p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3 basis-[31.6%] box-border">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Modelo
                          </span>
                          <p className="font-semibold text-sm mt-1">
                            {elementoInfo.modelo || "N/A"}
                          </p>
                        </div>
                        <div className="bg-white/50 rounded-lg p-3 flex-shrink-0 basis-full">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Categoría
                          </span>
                          <p className="font-semibold  text-sm mt-1">
                            {elementoInfo.categoria.nombre}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              onClick={addElemento}
              className="w-full border-dashed border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200 h-12 text-primary hover:text-primary font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Agregar Otro Elemento
            </Button>

            {errors.elementos && (
              <p className="text-red-500 text-sm">{errors.elementos.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Firmas Digitales */}
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">✍️</span>
              </div>
              Firmas Digitales
            </CardTitle>
            <CardDescription className="text-sm">
              Capture las firmas de los funcionarios involucrados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-2">
              <SignaturePadComponent
                label="Firma de Funcionario que Entrega"
                onSignatureChange={setFirmaEntrega}
                required={create}
              />
            </div>

            <div className="space-y-2">
              <SignaturePadComponent
                label="Firma de Funcionario que Recibe"
                onSignatureChange={setFirmaRecibe}
                required={create}
              />
            </div>
          </CardContent>
        </Card>

        {/* Campos ocultos */}
        <input type="hidden" {...register("tipo")} />
        {hiddenFields && (
          <>
            {Object.entries(hiddenFields).map(([name, value]) => (
              <input
                key={name}
                type="hidden"
                name={name}
                value={String(value)}
              />
            ))}
          </>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-border/50">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            size="lg"
          >
            {isSubmitting || isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {create ? "Creando..." : "Actualizando..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>{create ? "Crear Ticket" : "Actualizar Ticket"}</span>
                <span className="text-lg">🚀</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
