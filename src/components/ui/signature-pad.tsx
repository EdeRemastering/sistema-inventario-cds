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

      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <div className="w-full max-w-full overflow-hidden">
          <SignaturePad
            ref={signatureRef}
            canvasProps={{
              width: 400,
              height: 150,
              className: "border rounded-lg bg-white shadow-sm max-w-full h-auto",
            }}
            onBegin={handleBegin}
            onEnd={handleEnd}
          />
        </div>
        {isEmpty && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <p className="text-gray-400 text-sm bg-gray-50 px-2 py-1 rounded border">Firma aquí</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-between items-center">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={isEmpty}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Guardar
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {signatureData && (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium">Firma guardada</span>
            </div>
          )}
          
          {required && isEmpty && (
            <span className="text-xs text-red-500 font-medium">Firma requerida</span>
          )}
        </div>
      </div>
    </div>
  );
}
