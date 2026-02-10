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
import { actionMarkPrestamoAsReturned } from "@/modules/prestamos/actions";

type FirmaDevolucionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prestamoId: number;
  prestamoNumber: string;
  onSuccess?: () => void;
};

export function FirmaDevolucionDialog({
  open,
  onOpenChange,
  prestamoId,
  prestamoNumber,
  onSuccess,
}: FirmaDevolucionDialogProps) {
  const [firmaRecibe, setFirmaRecibe] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!firmaRecibe) {
      toast.error("Se requiere la firma del solicitante para completar la entrega");
      return;
    }

    setIsSubmitting(true);
    try {
      await actionMarkPrestamoAsReturned(prestamoId, undefined, firmaRecibe);
      toast.success("Préstamo marcado como entregado exitosamente");
      onSuccess?.();
      onOpenChange(false);
      setFirmaRecibe(null);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "Error desconocido al marcar préstamo como entregado";
      toast.error(errorMessage, {
        duration: 5000,
        description: "Por favor, verifica los datos e intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFirmaRecibe(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirmar Entrega - Préstamo {prestamoNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">
              ⚠️ Requisitos para la Entrega
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Se requiere la firma del solicitante</li>
              <li>• La firma de quien resuelve se toma del perfil del usuario autenticado</li>
            </ul>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <SignaturePadComponent
                label="Firma del solicitante"
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
            disabled={isSubmitting || !firmaRecibe}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Procesando..." : "Confirmar Entrega"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
