"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  FileText,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { TicketInvoice } from "./ticket-invoice";
import { DeleteButton } from "../delete-button";
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
  onMarkAsCompleted,
}: TicketActionsProps) {
  const [showInvoice, setShowInvoice] = useState(false);

  const isReturned = !!ticket.fecha_real_devolucion;
  const isOverdue =
    new Date() > new Date(ticket.fecha_estimada_devolucion) && !isReturned;

  const getStatusColor = () => {
    if (isReturned) return "text-green-600";
    if (isOverdue) return "text-red-600";
    return "text-blue-600";
  };

  const getStatusIcon = () => {
    if (isReturned) return <CheckCircle className="h-4 w-4" />;
    if (isOverdue) return <AlertTriangle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isReturned) return "Devuelto";
    if (isOverdue) return "Vencido";
    return "Activo";
  };

  const handleMarkAsReturned = async () => {
    if (onMarkAsReturned) {
      try {
        await onMarkAsReturned(ticket.id);
        toast.success("Ticket marcado como devuelto");
      } catch (error) {
        toast.error("Error al marcar como devuelto");
      }
    }
  };

  const handleMarkAsCompleted = async () => {
    if (onMarkAsCompleted) {
      try {
        await onMarkAsCompleted(ticket.id);
        toast.success("Ticket completado");
      } catch (error) {
        toast.error("Error al completar ticket");
      }
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInvoice(true)}
          className="h-8 w-8 p-0"
          title="Ver factura"
        >
          <FileText className="h-4 w-4" />
        </Button>

        {/* Editar */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Editar ticket"
        >
          <Edit className="h-4 w-4" />
        </Button>

        {/* Marcar como devuelto */}
        {!isReturned && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAsReturned}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
            title="Marcar como devuelto"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}

        {/* Completar ticket */}
        {!isReturned && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAsCompleted}
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            title="Completar ticket"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}

        {/* Eliminar */}
        <DeleteButton
          onConfirm={() => onDeleteTicket(ticket.id)}
          title="Eliminar ticket"
          description="¿Estás seguro de que quieres eliminar este ticket? Esta acción no se puede deshacer."
        />
      </div>

      {/* Factura del ticket */}
      {showInvoice && (
        <TicketInvoice ticket={ticket} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
}
