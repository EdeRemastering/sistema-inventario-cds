"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";

type SignatureDisplayProps = {
  signatureUrl?: string | null;
  label?: string;
  className?: string;
};

export function SignatureDisplay({ 
  signatureUrl, 
  label = "Firma", 
  className = "" 
}: SignatureDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!signatureUrl) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {label}: No disponible
      </div>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm font-medium">{label}:</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver Firma
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {label}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <img
              src={signatureUrl}
              alt={label}
              className="max-w-full h-auto border rounded-lg shadow-sm"
              style={{ maxHeight: "300px" }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Firma digital guardada
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
