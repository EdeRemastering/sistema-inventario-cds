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
  onConfirm: () => Promise<unknown>;
  children?: React.ReactNode;
  disabled?: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export function DeleteButton({
  onConfirm,
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
    setSubmitting(true);
    await toast.promise(onConfirm(), {
      loading: "Eliminando...",
      success: "Eliminado correctamente",
      error: "No se pudo eliminar",
    });
    setSubmitting(false);
    setOpen(false);
  }, [onConfirm]);

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
