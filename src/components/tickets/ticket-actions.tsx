"use client";

import { Button } from "../ui/button";
import { CheckCircle, Clock, Edit } from "lucide-react";
import { TicketInvoice } from "./ticket-invoice";
import { TicketUpsertDialog } from "./ticket-upsert-dialog";
import { DeleteButton } from "../delete-button";
import { StatusChangeButton } from "../status-change-button";
import type { TicketGuardado } from "../../modules/tickets_guardados/types";

type TicketActionsProps = {
  ticket: TicketGuardado;
  onUpdateTicket: (formData: FormData) => Promise<void>;
  onDeleteTicket: (id: number) => Promise<void>;
  onMarkAsReturned?: (id: number) => Promise<void>;
};

export function TicketActions({
  ticket,
  onUpdateTicket,
  onDeleteTicket,
  onMarkAsReturned,
}: TicketActionsProps) {
  const isDelivered = !!ticket.fecha_real_devolucion;

  const getStatusColor = () => {
    if (isDelivered) return "text-primary";
    return "text-secondary-foreground";
  };

  const getStatusIcon = () => {
    if (isDelivered) return <CheckCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isDelivered) return "Entregado";
    return "Activo";
  };

  const handleMarkAsDelivered = async () => {
    if (onMarkAsReturned) {
      await onMarkAsReturned(ticket.id);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Estado del ticket */}
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1">
        {/* Ver factura */}
        <TicketInvoice ticket={ticket} />

        {/* Editar */}
        <TicketUpsertDialog
          create={false}
          serverAction={onUpdateTicket}
          defaultValues={{
            numero_ticket: ticket.numero_ticket,
            fecha_salida: new Date(ticket.fecha_salida)
              .toISOString()
              .slice(0, 16),
            fecha_estimada_devolucion: ticket.fecha_estimada_devolucion
              ? new Date(ticket.fecha_estimada_devolucion)
                  .toISOString()
                  .slice(0, 16)
              : "",
            elemento: ticket.elemento ?? "",
            serie: ticket.serie ?? "",
            marca_modelo: ticket.marca_modelo ?? "",
            cantidad: String(ticket.cantidad),
            dependencia_entrega: ticket.dependencia_entrega ?? "",
            firma_funcionario_entrega: ticket.firma_funcionario_entrega ?? "",
            dependencia_recibe: ticket.dependencia_recibe ?? "",
            firma_funcionario_recibe: ticket.firma_funcionario_recibe ?? "",
            motivo: ticket.motivo ?? "",
            orden_numero: ticket.orden_numero ?? "",
          }}
          hiddenFields={{ id: ticket.id }}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          }
        />

        {/* Marcar como entregado */}
        {!isDelivered && (
          <StatusChangeButton
            onConfirm={handleMarkAsDelivered}
            buttonText="Marcar como Entregado"
            title="Marcar como Entregado"
            description={`¿Estás seguro de que quieres marcar el ticket ${ticket.numero_ticket} como entregado? Esta acción actualizará el estado del ticket y creará un movimiento de devolución.`}
            icon={<CheckCircle className="h-4 w-4" />}
            statusType="deliver"
          />
        )}

        {/* Eliminar */}
        <DeleteButton
          onConfirm={() => onDeleteTicket(ticket.id)}
          title="Eliminar ticket"
          description="¿Estás seguro de que quieres eliminar este ticket? Esta acción no se puede deshacer."
        />
      </div>
    </div>
  );
}
