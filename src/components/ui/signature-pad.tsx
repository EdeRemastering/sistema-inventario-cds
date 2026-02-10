"use client";

import { useRef, useState, useEffect } from "react";
import SignaturePad from "react-signature-canvas";
import { Button } from "./button";
import { Label } from "./label";
import { Trash2 } from "lucide-react";

const CANVAS_HEIGHT = 140;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [signatureData, setSignatureData] = useState<string | null>(
    defaultValue || null
  );
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: CANVAS_HEIGHT,
  });

  useEffect(() => {
    if (defaultValue && signatureRef.current) {
      signatureRef.current.fromDataURL(defaultValue);
      setIsEmpty(false);
    }
  }, [defaultValue]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const w = Math.max(0, el.clientWidth);
      setCanvasSize((prev) => (prev.width !== w ? { ...prev, width: w } : prev));
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  return (
    <div className={`space-y-2 min-w-0 ${className ?? ""}`}>
      <Label htmlFor="signature" className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Contenedor con borde discontinuo y padding uniforme en los cuatro lados */}
      <div className="relative min-w-0 w-full max-w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-900/50 sm:p-4">
        {/* Wrapper interior sin padding: el canvas se mide aquí para no invadir el padding */}
        <div
          ref={containerRef}
          className="relative min-h-[140px] min-w-0 w-full overflow-hidden rounded-md bg-white dark:bg-gray-800"
        >
          {canvasSize.width > 0 && (
            <SignaturePad
              ref={signatureRef}
              canvasProps={{
                width: canvasSize.width,
                height: canvasSize.height,
                className:
                  "touch-none block h-full w-full max-w-full rounded-md bg-white dark:bg-gray-800",
                style: { display: "block", maxWidth: "100%" },
              }}
              onBegin={handleBegin}
              onEnd={handleEnd}
              backgroundColor="white"
              penColor="black"
            />
          )}
        {isEmpty && canvasSize.width > 0 && (
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <p className="rounded border bg-gray-50 px-2 py-1 text-sm text-gray-400 dark:bg-gray-900 dark:text-gray-500">
              Firma aquí
            </p>
          </div>
        )}
        </div>
      </div>

      <div className="flex gap-2 justify-between items-center">
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

        <div className="flex items-center gap-2">
          {signatureData && (
            <div className="flex items-center gap-1 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium">Firma guardada</span>
            </div>
          )}

          {required && isEmpty && (
            <span className="text-xs text-red-500 font-medium">
              Firma requerida
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
