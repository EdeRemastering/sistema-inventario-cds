"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { CheckCircle, Clock, Edit } from "lucide-react";
import { PrestamoInvoice } from "./prestamo-invoice";
import { PrestamoUpsertDialog } from "./prestamo-upsert-dialog";
import { DeleteButton } from "../delete-button";
import { FirmaDevolucionDialog } from "./firma-devolucion-dialog";
import type { PrestamoGuardado } from "../../modules/prestamos/types";
import type { Ubicacion } from "../../modules/ubicaciones/types";

type PrestamoActionsProps = {
  prestamo: PrestamoGuardado;
  ubicaciones: Ubicacion[];
  onUpdatePrestamo: (formData: FormData) => Promise<void>;
  onDeletePrestamo: (id: number) => Promise<void>;
  onMarkAsCompleted?: (id: number) => Promise<void>;
};

export function PrestamoActions({
  prestamo,
  ubicaciones,
  onUpdatePrestamo,
  onDeletePrestamo,
  onMarkAsCompleted,
}: PrestamoActionsProps) {
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);

  const isDelivered =
    prestamo.motivo?.includes("devuelto") ||
    prestamo.motivo?.includes("completado") ||
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

  const handleMarkAsDelivered = () => {
    setShowSignatureDialog(true);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        <PrestamoInvoice prestamo={prestamo} />

        <PrestamoUpsertDialog
          create={false}
          serverAction={onUpdatePrestamo}
          ubicaciones={ubicaciones}
          defaultValues={{
            numero_ticket: prestamo.numero_ticket,
            fecha_salida: new Date(prestamo.fecha_salida)
              .toISOString()
              .slice(0, 16) as unknown as Date,
            fecha_estimada_devolucion: prestamo.fecha_estimada_devolucion
              ? (new Date(prestamo.fecha_estimada_devolucion)
                  .toISOString()
                  .slice(0, 16) as unknown as Date)
              : ("" as unknown as Date),
            ubicacion_id: prestamo.ubicacion_id ? String(prestamo.ubicacion_id) : "",
            dependencia_recibe: prestamo.dependencia_recibe ?? "",
            persona_recibe_nombre: prestamo.persona_recibe_nombre ?? "",
            persona_recibe_apellido: prestamo.persona_recibe_apellido ?? "",
            firma_funcionario_recibe: prestamo.firma_funcionario_recibe ?? "",
            motivo: prestamo.motivo ?? "",
            orden_numero: prestamo.orden_numero ?? "",
          }}
          hiddenFields={{ id: prestamo.id }}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              data-tour="prestamos-edit"
            >
              <Edit className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          }
        />

        {!isDelivered && (
          <Button
            onClick={handleMarkAsDelivered}
            variant="outline"
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            data-tour="prestamos-deliver"
          >
            <CheckCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Marcar como Entregado</span>
          </Button>
        )}

        <DeleteButton
          onConfirm={() => onDeletePrestamo(prestamo.id)}
          title="Eliminar préstamo"
          description="¿Estás seguro de que quieres eliminar este préstamo? Esta acción no se puede deshacer."
        />
      </div>

      <FirmaDevolucionDialog
        open={showSignatureDialog}
        onOpenChange={setShowSignatureDialog}
        prestamoId={prestamo.id}
        prestamoNumber={prestamo.numero_ticket}
        onSuccess={() => {}}
      />
    </div>
  );
}
