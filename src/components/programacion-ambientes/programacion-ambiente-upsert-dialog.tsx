"use client";

import { useState, useEffect } from "react";
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { GenericDatePicker } from "../ui/generic-date-picker";
import { Plus } from "lucide-react";
import type { UbicacionOption } from "../../lib/form-options";
import type { ProgramacionAmbiente } from "../../modules/programacion_ambientes/types";

const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
const schema = z
  .object({
    ubicacion_id: z.string().min(1, "Ubicación requerida"),
    fecha: z.string().min(1, "Fecha requerida"),
    hora_inicio: z.string().regex(horaRegex, "Formato HH:mm (ej. 08:00)"),
    hora_fin: z.string().regex(horaRegex, "Formato HH:mm (ej. 09:00)"),
    docente_id_q10: z.string().optional(),
    descripcion: z.string().optional(),
    ocupado: z.boolean(),
  })
  .refine(
    (d) => {
      const [h1, m1] = d.hora_inicio.split(":").map(Number);
      const [h2, m2] = d.hora_fin.split(":").map(Number);
      return h2 * 60 + m2 > h1 * 60 + m1;
    },
    { message: "La hora de fin debe ser mayor que la hora de inicio", path: ["hora_fin"] }
  );

type FormValues = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<void>;
  ubicaciones: UbicacionOption[];
  create?: boolean;
  defaultValues?: Partial<ProgramacionAmbiente>;
  onClose?: () => void;
};

export function ProgramacionAmbienteUpsertDialog({
  serverAction,
  ubicaciones,
  create = true,
  defaultValues,
  onClose,
}: Props) {
  const [open, setOpen] = useState(create);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ubicacion_id: defaultValues?.ubicacion_id?.toString() ?? "",
      fecha: defaultValues?.fecha
        ? new Date(defaultValues.fecha).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      hora_inicio: defaultValues?.hora_inicio ?? "08:00",
      hora_fin: defaultValues?.hora_fin ?? "09:00",
      docente_id_q10: defaultValues?.docente_id_q10 ?? "",
      descripcion: defaultValues?.descripcion ?? "",
      ocupado: defaultValues?.ocupado ?? true,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ubicacion_id: defaultValues.ubicacion_id?.toString() ?? "",
        fecha: defaultValues.fecha
          ? new Date(defaultValues.fecha).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        hora_inicio: defaultValues.hora_inicio ?? "08:00",
        hora_fin: defaultValues.hora_fin ?? "09:00",
        docente_id_q10: defaultValues.docente_id_q10 ?? "",
        descripcion: defaultValues.descripcion ?? "",
        ocupado: defaultValues.ocupado ?? true,
      });
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const fd = new FormData();
      fd.append("ubicacion_id", data.ubicacion_id);
      fd.append("fecha", data.fecha);
      fd.append("hora_inicio", data.hora_inicio);
      fd.append("hora_fin", data.hora_fin);
      if (data.docente_id_q10) fd.append("docente_id_q10", data.docente_id_q10);
      if (data.descripcion) fd.append("descripcion", data.descripcion);
      fd.append("ocupado", String(data.ocupado));
      if (!create && defaultValues?.id) fd.append("id", String(defaultValues.id));

      await toast.promise(serverAction(fd), {
        loading: create ? "Creando..." : "Actualizando...",
        success: create ? "Programación creada" : "Programación actualizada",
        error: "Error al guardar",
      });
      reset();
      setOpen(false);
      onClose?.();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {create && (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva programación
        </Button>
      )}
      <Dialog
        open={create ? open : true}
        onOpenChange={(o) => {
          if (create) setOpen(o);
          else onClose?.();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {create ? "Nueva programación de ambiente" : "Editar programación"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Ambiente / Ubicación</Label>
              <Select
                value={watch("ubicacion_id")}
                onValueChange={(v) => setValue("ubicacion_id", v ?? "")}
                disabled={ubicaciones.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona ambiente" />
                </SelectTrigger>
                <SelectContent>
                  {ubicaciones.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.codigo} - {u.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ubicacion_id && (
                <p className="text-red-500 text-sm">{errors.ubicacion_id.message}</p>
              )}
            </div>
            <div>
              <Label>Fecha</Label>
              <GenericDatePicker
                label=""
                value={watch("fecha") ? new Date(watch("fecha")) : undefined}
                onChange={(d) =>
                  setValue("fecha", d ? d.toISOString().slice(0, 10) : "")
                }
                error={errors.fecha?.message}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hora inicio (HH:mm)</Label>
                <Input
                  type="time"
                  {...register("hora_inicio")}
                  defaultValue="08:00"
                />
                {errors.hora_inicio && (
                  <p className="text-red-500 text-sm">{errors.hora_inicio.message}</p>
                )}
              </div>
              <div>
                <Label>Hora fin (HH:mm)</Label>
                <Input type="time" {...register("hora_fin")} defaultValue="09:00" />
                {errors.hora_fin && (
                  <p className="text-red-500 text-sm">{errors.hora_fin.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label>ID Docente Q10 (opcional)</Label>
              <Input
                placeholder="ID del docente en Q10"
                {...register("docente_id_q10")}
              />
              <p className="text-xs text-muted-foreground">
                No se crean usuarios; se usa el ID externo de Q10
              </p>
            </div>
            <div>
              <Label>Descripción (opcional)</Label>
              <Input placeholder="Ej: Clase de programación" {...register("descripcion")} />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={watch("ocupado")}
                onCheckedChange={(v) => setValue("ocupado", v)}
              />
              <Label>Ocupado</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => (create ? setOpen(false) : onClose?.())}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {create ? "Crear" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
