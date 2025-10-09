"use client";
import { useState, useCallback, useRef } from "react";
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
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleConfirm = useCallback(async () => {
    if (action) {
      setSubmitting(true);
      // Submit via server action form
      formRef.current?.requestSubmit();
      setSubmitting(false);
      setOpen(false);
      return;
    }

    if (onConfirm) {
      setSubmitting(true);
      await toast.promise(onConfirm(), {
        loading: "Eliminando...",
        success: "Eliminado correctamente",
        error: "No se pudo eliminar",
      });
      setSubmitting(false);
      setOpen(false);
    }
  }, [action, onConfirm]);

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
          {action ? (
            <form ref={formRef} action={action} className="hidden">
              {fields &&
                Object.entries(fields).map(([name, value]) => (
                  <input
                    key={name}
                    type="hidden"
                    name={name}
                    value={String(value)}
                  />
                ))}
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
