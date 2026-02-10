"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { GenericDatePicker } from "../ui/generic-date-picker";
import { ElementoSearchSelect } from "../ui/elemento-search-select";

const schema = z.object({
  elemento_id: z.string().min(1, "Selecciona elemento"),
  fecha_baja: z.string().min(1, "Fecha requerida"),
  motivo: z.string().min(1, "Motivo requerido"),
  evidencia_pdf_url: z.string().min(1, "Sube la evidencia en PDF"),
  autorizado_por_id: z.string().min(1, "Selecciona autorizador"),
});

type BajaFormValues = z.infer<typeof schema>;

type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  categoria_id: number;
  subcategoria_id: number | null;
  ubicacion_id: number | null;
  ubicacion_rel?: { id: number; codigo: string; nombre: string; sede?: { id: number } | null } | null;
};

type Autorizador = { id: number; nombre: string; apellido: string | null };

type Props = {
  serverAction: (formData: globalThis.FormData) => Promise<void>;
  elementos: ElementoOption[];
  autorizadores: Autorizador[];
};

export function BajaUpsertDialog({
  serverAction,
  elementos,
  autorizadores,
}: Props) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [evidenciaUrl, setEvidenciaUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BajaFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      elemento_id: "",
      fecha_baja: new Date().toISOString().slice(0, 10),
      motivo: "",
      evidencia_pdf_url: "",
      autorizado_por_id: "",
    },
  });

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads/pdfs", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error subiendo PDF");
      setEvidenciaUrl(data.url);
      setValue("evidencia_pdf_url", data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error subiendo PDF");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: BajaFormValues) => {
    try {
      const fd = new FormData();
      fd.append("elemento_id", data.elemento_id);
      fd.append("fecha_baja", data.fecha_baja);
      fd.append("motivo", data.motivo);
      fd.append("evidencia_pdf_url", data.evidencia_pdf_url);
      fd.append("autorizado_por_id", data.autorizado_por_id);

      await toast.promise(serverAction(fd), {
        loading: "Registrando baja...",
        success: "Baja registrada correctamente",
        error: "Error al registrar la baja",
      });
      reset();
      setEvidenciaUrl("");
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Registrar baja</Button>
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEvidenciaUrl(""); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar baja de elemento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Elemento</Label>
              <ElementoSearchSelect
                elementos={elementos}
                value={watch("elemento_id") || undefined}
                onValueChange={(v) => setValue("elemento_id", v ?? "")}
                placeholder="Buscar elemento..."
                error={errors.elemento_id?.message}
              />
            </div>
            <div>
              <Label>Fecha de baja</Label>
              <GenericDatePicker
                label=""
                value={watch("fecha_baja") ? new Date(watch("fecha_baja")) : undefined}
                onChange={(d) => setValue("fecha_baja", d ? d.toISOString().slice(0, 10) : "")}
                error={errors.fecha_baja?.message}
              />
            </div>
            <div>
              <Label>Motivo</Label>
              <Textarea
                {...register("motivo")}
                placeholder="Motivo de la baja..."
                rows={3}
              />
              {errors.motivo && <p className="text-red-500 text-sm">{errors.motivo.message}</p>}
            </div>
            <div>
              <Label>Evidencia en PDF (obligatoria)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Subiendo..." : evidenciaUrl ? "PDF subido ✓" : "Subir PDF"}
              </Button>
              <input type="hidden" {...register("evidencia_pdf_url")} />
              {errors.evidencia_pdf_url && (
                <p className="text-red-500 text-sm">{errors.evidencia_pdf_url.message}</p>
              )}
            </div>
            <div>
              <Label>Autorizado por (rol Autorizador o Administrador)</Label>
              <Select
                value={watch("autorizado_por_id")}
                onValueChange={(v) => setValue("autorizado_por_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona autorizador" />
                </SelectTrigger>
                <SelectContent>
                  {autorizadores.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.nombre} {a.apellido ?? ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.autorizado_por_id && (
                <p className="text-red-500 text-sm">{errors.autorizado_por_id.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Registrar baja
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
