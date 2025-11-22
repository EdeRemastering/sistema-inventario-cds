"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { CheckCircle, Clock, Edit } from "lucide-react";
import { TicketInvoice } from "./ticket-invoice";
import { TicketUpsertDialog } from "./ticket-upsert-dialog";
import { DeleteButton } from "../delete-button";
import { StatusChangeButton } from "../status-change-button";
import { DeliverySignatureDialog } from "./delivery-signature-dialog";
import type { TicketGuardado } from "../../modules/tickets_guardados/types";

type TicketActionsProps = {
  ticket: TicketGuardado;
  onUpdateTicket: (formData: FormData) => Promise<void>;
  onDeleteTicket: (id: number) => Promise<void>;
  onMarkAsReturned?: (id: number) => Promise<void>;
  onMarkAsCompleted?: (id: number) => Promise<void>;
};

export function TicketActions({
  ticket,
  onUpdateTicket,
  onDeleteTicket,
  onMarkAsReturned,
}: TicketActionsProps) {
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);

  // Los tickets_guardados no tienen fecha_real_devolucion,
  // verificamos si fue marcado como devuelto por el motivo
  const isDelivered =
    ticket.motivo?.includes("devuelto") ||
    ticket.motivo?.includes("completado") ||
    false;

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
    setShowSignatureDialog(true);
  };

  const handleSignatureSuccess = async () => {
    // El diálogo de firmas ya maneja la llamada a actionMarkTicketAsReturned
    // con las firmas necesarias, por lo que no necesitamos llamarlo aquí nuevamente
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
      {/* Estado del ticket */}
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 flex-wrap">
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
              .slice(0, 16) as unknown as Date,
            fecha_estimada_devolucion: ticket.fecha_estimada_devolucion
              ? (new Date(ticket.fecha_estimada_devolucion)
                  .toISOString()
                  .slice(0, 16) as unknown as Date)
              : ("" as unknown as Date),
            dependencia_entrega: ticket.dependencia_entrega ?? "",
            persona_entrega_nombre: ticket.persona_entrega_nombre ?? "",
            persona_entrega_apellido: ticket.persona_entrega_apellido ?? "",
            firma_funcionario_entrega: ticket.firma_funcionario_entrega ?? "",
            dependencia_recibe: ticket.dependencia_recibe ?? "",
            persona_recibe_nombre: ticket.persona_recibe_nombre ?? "",
            persona_recibe_apellido: ticket.persona_recibe_apellido ?? "",
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
              <Edit className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          }
        />

        {/* Marcar como entregado */}
        {!isDelivered && (
          <Button
            onClick={handleMarkAsDelivered}
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Marcar como Entregado</span>
          </Button>
        )}

        {/* Eliminar */}
        <DeleteButton
          onConfirm={() => onDeleteTicket(ticket.id)}
          title="Eliminar ticket"
          description="¿Estás seguro de que quieres eliminar este ticket? Esta acción no se puede deshacer."
        />
      </div>

      {/* Diálogo de firmas para entrega */}
      <DeliverySignatureDialog
        open={showSignatureDialog}
        onOpenChange={setShowSignatureDialog}
        ticketId={ticket.id}
        ticketNumber={ticket.numero_ticket}
        onSuccess={handleSignatureSuccess}
      />
    </div>
  );
}
