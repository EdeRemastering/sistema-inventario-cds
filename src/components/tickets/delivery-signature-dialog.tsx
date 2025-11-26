"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { SignaturePadComponent } from "../ui/signature-pad";
import { toast } from "sonner";
import { actionMarkTicketAsReturned } from "@/modules/tickets_guardados/actions";

type DeliverySignatureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: number;
  ticketNumber: string;
  onSuccess?: () => void;
};

export function DeliverySignatureDialog({
  open,
  onOpenChange,
  ticketId,
  ticketNumber,
  onSuccess,
}: DeliverySignatureDialogProps) {
  const [firmaEntrega, setFirmaEntrega] = useState<string | null>(null);
  const [firmaRecibe, setFirmaRecibe] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!firmaEntrega || !firmaRecibe) {
      toast.error("Se requieren ambas firmas para completar la entrega");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Iniciando proceso de devolución para ticket:", ticketId);
      await actionMarkTicketAsReturned(ticketId, firmaEntrega, firmaRecibe);
      console.log("Devolución completada exitosamente");
      toast.success("Ticket marcado como entregado exitosamente");
      onSuccess?.();
      onOpenChange(false);
      // Limpiar firmas
      setFirmaEntrega(null);
      setFirmaRecibe(null);
    } catch (error) {
      console.error("Error detallado marcando ticket como entregado:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Error desconocido al marcar ticket como entregado";
      
      toast.error(errorMessage, {
        duration: 5000,
        description: "Por favor, verifica los datos e intenta nuevamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFirmaEntrega(null);
    setFirmaRecibe(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirmar Entrega - Ticket {ticketNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">
              ⚠️ Requisitos para la Entrega
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Se requiere la firma de quien entrega el elemento</li>
              <li>• Se requiere la firma de quien recibe el elemento</li>
              <li>• Ambas firmas son obligatorias para completar la entrega</li>
            </ul>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <SignaturePadComponent
                label="Firma de quien Entrega"
                onSignatureChange={setFirmaEntrega}
                required={true}
              />
            </div>

            <div className="space-y-2">
              <SignaturePadComponent
                label="Firma de quien Recibe"
                onSignatureChange={setFirmaRecibe}
                required={true}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !firmaEntrega || !firmaRecibe}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Procesando..." : "Confirmar Entrega"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
