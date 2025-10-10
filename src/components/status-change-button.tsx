"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type StatusChangeButtonProps = {
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  buttonText?: string;
  buttonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  statusType?: "deliver" | "warning";
};

export function StatusChangeButton({
  onConfirm,
  title,
  description,
  buttonText,
  buttonVariant = "outline",
  buttonSize = "sm",
  buttonClassName = "",
  icon,
  children,
  statusType = "deliver",
}: StatusChangeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    const promise = onConfirm();

    toast.promise(promise, {
      loading: "Procesando...",
      success: () => {
        setIsOpen(false);
        return "Estado actualizado correctamente";
      },
      error: "Error al actualizar el estado",
    });
  };

  const getIcon = () => {
    if (icon) return icon;
    if (statusType === "warning") return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getButtonClassName = () => {
    if (buttonClassName) return buttonClassName;

    // Si hay texto, usar padding normal, si no, usar tamaño fijo
    const baseClasses = buttonText ? "px-3 py-2" : "h-8 w-8 p-0";

    if (statusType === "warning") {
      return `${baseClasses} text-orange-600 hover:text-orange-700 hover:bg-orange-50`;
    }

    return `${baseClasses} text-green-600 hover:text-green-700 hover:bg-green-50`;
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonText ? "sm" : buttonSize}
        onClick={() => setIsOpen(true)}
        className={getButtonClassName()}
        title={title}
      >
        {getIcon()}
        {buttonText && (
          <span className={getIcon() ? "ml-2" : ""}>{buttonText}</span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getIcon()}
              {title}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className={
                statusType === "warning"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {statusType === "warning" ? "Confirmar" : "Marcar como Entregado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {children}
    </>
  );
}
