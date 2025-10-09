"use client";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type DeleteButtonProps = {
  onConfirm?: () => Promise<unknown>;
  action?: (formData: FormData) => Promise<void>; // server action
  fields?: Record<string, string | number>; // hidden fields to submit
  children?: React.ReactNode;
  disabled?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export function DeleteButton({
  onConfirm,
  action,
  fields,
  children = "Eliminar",
  disabled,
  title = "¿Eliminar?",
  description = "Esta acción no se puede deshacer.",
  confirmText = "Sí, eliminar",
  cancelText = "Cancelar",
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (action) {
      setSubmitting(true);

      try {
        const formData = new FormData();

        // Agregar campos ocultos si existen
        if (fields) {
          Object.entries(fields).forEach(([name, value]) => {
            formData.append(name, String(value));
          });
        }

        const promise = action(formData);

        await toast.promise(promise, {
          loading: "Eliminando...",
          success: "Eliminado correctamente",
          error: "No se pudo eliminar",
        });

        setSubmitting(false);
        setOpen(false);
      } catch (error) {
        setSubmitting(false);
        console.error("Error al eliminar:", error);
      }
      return;
    }

    if (onConfirm) {
      setSubmitting(true);

      try {
        await toast.promise(onConfirm(), {
          loading: "Eliminando...",
          success: "Eliminado correctamente",
          error: "No se pudo eliminar",
        });
        setSubmitting(false);
        setOpen(false);
      } catch (error) {
        setSubmitting(false);
        console.error("Error al eliminar:", error);
      }
    }
  }, [action, onConfirm, fields]);

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
        disabled={disabled || submitting}
      >
        {children}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{description}</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              {cancelText}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
