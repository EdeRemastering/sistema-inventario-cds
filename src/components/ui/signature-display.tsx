"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

type SignatureDisplayProps = {
  signatureUrl?: string | null;
  label?: string;
  className?: string;
};

export function SignatureDisplay({
  signatureUrl,
  label = "Firma",
  className = "",
}: SignatureDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!signatureUrl) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {label}: No disponible
      </div>
    );
  }

  // Verificar si es un data URL (base64) o una URL de archivo
  const isDataUrl = signatureUrl.startsWith('data:image/');
  const isR2Url = signatureUrl.includes('r2.cloudflarestorage.com') || signatureUrl.includes('r2.dev');

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm font-medium">{label}:</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="text-primary hover:text-primary/80 hover:bg-primary/10"
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver Firma
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {isDataUrl || isR2Url ? (
              // Para data URLs y R2, usar img nativa (mejor compatibilidad con CORS)
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signatureUrl}
                alt={label}
                className="max-w-full h-auto border rounded-lg shadow-sm"
                style={{ maxHeight: "300px", maxWidth: "400px" }}
                onError={(e) => {
                  console.error('Error cargando imagen:', signatureUrl);
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvciBjYXJnYW5kbyBpbWFnZW48L3RleHQ+PC9zdmc+';
                }}
              />
            ) : (
              // Para URLs locales, usar Next Image
              <Image
                src={signatureUrl}
                alt={label}
                width={400}
                height={200}
                className="max-w-full h-auto border rounded-lg shadow-sm"
                style={{ maxHeight: "300px" }}
                onError={() => console.error('Error cargando imagen:', signatureUrl)}
              />
            )}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Firma digital guardada
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
