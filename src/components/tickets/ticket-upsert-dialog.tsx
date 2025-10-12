"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { TicketForm } from "./ticket-form";
import { DialogDescription } from "@radix-ui/react-dialog";

type Elemento = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  cantidad: number;
  categoria: {
    nombre: string;
  };
  subcategoria?: {
    nombre: string;
  } | null;
};

type Props = {
  create?: boolean;
  defaultValues?: Record<string, unknown>;
  hiddenFields?: Record<string, string | number>;
  trigger?: React.ReactNode;
};

export function TicketUpsertDialog({
  create = true,
  defaultValues,
  hiddenFields,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [elementos, setElementos] = useState<Elemento[]>([]);

  useEffect(() => {
    const fetchElementos = async () => {
      try {
        const response = await fetch("/api/elementos");
        if (response.ok) {
          const data = await response.json();
          setElementos(data);
        }
      } catch (error) {
        console.error("Error fetching elementos:", error);
      }
    };

    if (open) {
      fetchElementos();
    }
  }, [open]);

  const onSubmit = async (data: {
    numero_ticket?: string;
    orden_numero: string;
    fecha_movimiento: Date;
    dependencia_entrega: string;
    cargo_funcionario_entrega?: string;
    dependencia_recibe: string;
    cargo_funcionario_recibe?: string;
    motivo: string;
    fecha_estimada_devolucion: Date;
    fecha_real_devolucion?: Date;
    observaciones_entrega?: string;
    observaciones_devolucion?: string;
    firma_recepcion?: string;
    tipo: "SALIDA" | "DEVOLUCION";
    firma_entrega?: string;
    firma_recibe?: string;
    hora_entrega?: Date;
    hora_devolucion?: Date;
    firma_devuelve?: string;
    firma_recibe_devolucion?: string;
    devuelto_por?: string;
    recibido_por?: string;
    elementos: { elemento_id: number; cantidad: number }[];
    firmas?: { entrega?: string; recibe?: string };
  }) => {
    // Preparar los datos para enviar a la API
    const ticketData = {
      numero_ticket: data.numero_ticket,
      orden_numero: data.orden_numero,
      fecha_movimiento: data.fecha_movimiento.toISOString(),
      dependencia_entrega: data.dependencia_entrega,
      cargo_funcionario_entrega: data.cargo_funcionario_entrega,
      dependencia_recibe: data.dependencia_recibe,
      cargo_funcionario_recibe: data.cargo_funcionario_recibe,
      motivo: data.motivo,
      fecha_estimada_devolucion: data.fecha_estimada_devolucion.toISOString(),
      fecha_real_devolucion: data.fecha_real_devolucion?.toISOString(),
      observaciones_entrega: data.observaciones_entrega,
      observaciones_devolucion: data.observaciones_devolucion,
      firma_recepcion: data.firma_recepcion,
      tipo: data.tipo,
      firma_entrega: data.firma_entrega,
      firma_recibe: data.firma_recibe,
      hora_entrega: data.hora_entrega?.toISOString(),
      hora_devolucion: data.hora_devolucion?.toISOString(),
      firma_devuelve: data.firma_devuelve,
      firma_recibe_devolucion: data.firma_recibe_devolucion,
      devuelto_por: data.devuelto_por,
      recibido_por: data.recibido_por,
      elementos: data.elementos,
      firmas: {
        entrega: data.firmas?.entrega,
        recibe: data.firmas?.recibe,
      },
    };

    const createTicketPromise = fetch("/api/tickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketData),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar el formulario");
      }
      return response.json();
    });

    toast.promise(createTicketPromise, {
      loading: create ? "Creando ticket..." : "Actualizando ticket...",
      success: () => {
        setOpen(false);
        window.location.reload();
        return create
          ? "Ticket creado exitosamente"
          : "Ticket actualizado exitosamente";
      },
      error: (error) => {
        console.error("Error:", error);
        return error instanceof Error
          ? error.message
          : "Error al procesar el formulario";
      },
    });
  };

  const btnText = create ? "Crear Ticket" : "Editar Ticket";
  const title = create ? "Crear Nuevo Ticket" : "Editar Ticket";

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)}>{btnText}</Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-full max-h-[95vh] overflow-x-hidden overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              {create
                ? "Complete la información para crear un nuevo ticket de préstamo"
                : "Modifique la información del ticket existente"}
            </DialogDescription>
          </DialogHeader>
          <div className="p-2">
            <TicketForm
              onSubmit={onSubmit}
              create={create}
              defaultValues={defaultValues}
              hiddenFields={hiddenFields}
              elementos={elementos}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
