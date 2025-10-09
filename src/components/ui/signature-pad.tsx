"use client";

import { useRef, useState, useEffect } from "react";
import SignaturePad from "react-signature-canvas";
import { Button } from "./button";
import { Label } from "./label";
import { Trash2, Download } from "lucide-react";

type SignaturePadProps = {
  onSignatureChange?: (signature: string | null) => void;
  defaultValue?: string | null;
  label?: string;
  required?: boolean;
  className?: string;
};

export function SignaturePadComponent({
  onSignatureChange,
  defaultValue,
  label = "Firma",
  required = false,
  className,
}: SignaturePadProps) {
  const signatureRef = useRef<SignaturePad>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [signatureData, setSignatureData] = useState<string | null>(
    defaultValue || null
  );

  useEffect(() => {
    if (defaultValue && signatureRef.current) {
      signatureRef.current.fromDataURL(defaultValue);
      setIsEmpty(false);
    }
  }, [defaultValue]);

  const handleBegin = () => {
    setIsEmpty(false);
  };

  const handleEnd = () => {
    if (signatureRef.current) {
      const dataURL = signatureRef.current.toDataURL();
      setSignatureData(dataURL);
      onSignatureChange?.(dataURL);
    }
  };

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
      setSignatureData(null);
      onSignatureChange?.(null);
    }
  };

  const handleSave = () => {
    if (signatureRef.current && !isEmpty) {
      const dataURL = signatureRef.current.toDataURL();
      setSignatureData(dataURL);
      onSignatureChange?.(dataURL);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="signature" className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
        <SignaturePad
          ref={signatureRef}
          canvasProps={{
            width: 400,
            height: 150,
            className: "border rounded-lg bg-white",
          }}
          onBegin={handleBegin}
          onEnd={handleEnd}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={isEmpty}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Limpiar
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isEmpty}
        >
          <Download className="h-4 w-4 mr-1" />
          Guardar
        </Button>
      </div>

      {signatureData && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">Firma guardada ✓</p>
        </div>
      )}

      {required && isEmpty && (
        <p className="text-xs text-red-500">La firma es requerida</p>
      )}
    </div>
  );
}
