"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "./button";
import { Camera, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
};

export function ImageUpload({ value, onChange, disabled, className = "" }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Subir imagen al servidor
  const uploadImage = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al subir imagen");
      }

      setPreviewUrl(data.url);
      onChange(data.url);
      toast.success("Imagen subida correctamente");
    } catch (error) {
      console.error("Error uploading:", error);
      toast.error(error instanceof Error ? error.message : "Error al subir imagen");
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  // Manejar selección de archivo
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadImage(file);
  }, [uploadImage]);

  // Abrir cámara
  const openCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Cámara trasera por defecto
        audio: false,
      });

      streamRef.current = stream;
      setIsCameraOpen(true);

      // Esperar a que el video esté listo
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("No se pudo acceder a la cámara");
    }
  }, []);

  // Cerrar cámara
  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  // Capturar foto
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Configurar canvas con dimensiones del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar frame del video
    context.drawImage(video, 0, 0);

    // Convertir a blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("Error al capturar imagen");
        return;
      }

      const file = new File([blob], `foto-${Date.now()}.jpg`, { type: "image/jpeg" });
      closeCamera();
      await uploadImage(file);
    }, "image/jpeg", 0.9);
  }, [closeCamera, uploadImage]);

  // Eliminar imagen
  const removeImage = useCallback(() => {
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  // Si la cámara está abierta
  if (isCameraOpen) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="flex gap-2 mt-3">
          <Button
            type="button"
            onClick={capturePhoto}
            className="flex-1"
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            Capturar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={closeCamera}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // Si hay imagen previa
  if (previewUrl) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border">
          <img
            src={previewUrl}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Estado inicial (sin imagen)
  return (
    <div className={`${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
      />
      
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/30">
        <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-4">
          Sube una foto del elemento o toma una con la cámara
        </p>
        
        <div className="flex gap-2 justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Subir archivo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={openCamera}
            disabled={disabled || isUploading}
          >
            <Camera className="h-4 w-4 mr-2" />
            Tomar foto
          </Button>
        </div>
      </div>
    </div>
  );
}
