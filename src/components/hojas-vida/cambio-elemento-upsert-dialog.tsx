"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { DatePicker } from "../ui/date-picker";
import type { CambioElemento } from "../../modules/hojas_vida/types";

const schema = z.object({
  hoja_vida_id: z.number().int().positive(),
  fecha_cambio: z.string().min(1, "Fecha requerida"),
  descripcion_cambio: z.string().min(1, "Descripción requerida"),
  tipo_cambio: z.enum(["ACTUALIZACION", "REPARACION", "MEJORA", "REEMPLAZO"]),
  usuario: z.string().max(50).optional().or(z.literal("")),
  costo: z.string().optional().or(z.literal("")),
});

type CambioFormValues = z.infer<typeof schema>;

type Props = {
  serverAction: (formData: FormData) => Promise<unknown>;
  create: boolean;
  hoja_vida_id: number;
  defaultValues?: Omit<Partial<CambioElemento>, "fecha_cambio"> & {
    fecha_cambio?: string;
  };
  hiddenFields?: { id?: number };
  onClose?: () => void;
};

function formatDateForInput(d: Date | string | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

function getUsuarioFromSession(
  session: ReturnType<typeof useSession>["data"]
): string {
  const nombre = (session?.user as { nombre?: string })?.nombre ?? "";
  const apellido = (session?.user as { apellido?: string })?.apellido ?? "";
  const full = `${nombre} ${apellido}`.trim();
  return (
    full ||
    session?.user?.name ||
    (session?.user as { username?: string })?.username ||
    ""
  );
}

export function CambioElementoUpsertDialog({
  serverAction,
  create,
  hoja_vida_id,
  defaultValues,
  hiddenFields,
  onClose,
}: Props) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const usuarioSesion = getUsuarioFromSession(session);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CambioFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hoja_vida_id,
      fecha_cambio: defaultValues
        ? formatDateForInput(defaultValues.fecha_cambio)
        : new Date().toISOString().slice(0, 10),
      descripcion_cambio: defaultValues?.descripcion_cambio ?? "",
      tipo_cambio: defaultValues?.tipo_cambio ?? "ACTUALIZACION",
      usuario: defaultValues?.usuario ?? usuarioSesion ?? "",
      costo: defaultValues?.costo != null ? String(defaultValues.costo) : "",
    },
  });

  // Al abrir el diálogo en creación, rellenar "Registrado por" con el usuario en sesión
  useEffect(() => {
    if (!create || !open) return;
    const current = watch("usuario");
    if (!current && usuarioSesion) {
      setValue("usuario", usuarioSesion);
    }
  }, [create, open, usuarioSesion, setValue, watch]);

  const onSubmit = async (data: CambioFormValues) => {
    try {
      const formData = new FormData();
      formData.append("hoja_vida_id", String(data.hoja_vida_id));
      formData.append("fecha_cambio", data.fecha_cambio);
      formData.append("descripcion_cambio", data.descripcion_cambio);
      formData.append("tipo_cambio", data.tipo_cambio);
      formData.append("usuario", data.usuario ?? "");
      if (data.costo && data.costo.trim() !== "")
        formData.append("costo", data.costo.trim());
      if (hiddenFields?.id) formData.append("id", String(hiddenFields.id));

      await serverAction(formData);
      toast.success(create ? "Cambio registrado" : "Cambio actualizado");
      reset();
      setOpen(false);
      onClose?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  const fechaVal = watch("fecha_cambio");

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        {create ? "Agregar cambio" : "Editar"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {create ? "Registrar cambio" : "Editar cambio"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            <input
              type="hidden"
              {...register("hoja_vida_id")}
              value={hoja_vida_id}
            />
            <div className="grid gap-1">
              <Label>Fecha del cambio</Label>
              <DatePicker
                date={fechaVal ? new Date(fechaVal) : undefined}
                onDateChange={(d) =>
                  setValue(
                    "fecha_cambio",
                    d ? d.toISOString().slice(0, 10) : ""
                  )
                }
              />
              {errors.fecha_cambio && (
                <p className="text-destructive text-sm">
                  {errors.fecha_cambio.message}
                </p>
              )}
            </div>
            <div className="grid gap-1">
              <Label>Tipo de cambio</Label>
              <Select
                value={watch("tipo_cambio")}
                onValueChange={(v) =>
                  setValue("tipo_cambio", v as CambioFormValues["tipo_cambio"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTUALIZACION">Actualización</SelectItem>
                  <SelectItem value="REPARACION">Reparación</SelectItem>
                  <SelectItem value="MEJORA">Mejora</SelectItem>
                  <SelectItem value="REEMPLAZO">Reemplazo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Descripción</Label>
              <Textarea
                {...register("descripcion_cambio")}
                placeholder="Ej: Se reemplazó el cable de alimentación."
                rows={3}
              />
              {errors.descripcion_cambio && (
                <p className="text-destructive text-sm">
                  {errors.descripcion_cambio.message}
                </p>
              )}
            </div>
            <div className="grid gap-1">
              <Label>Registrado por</Label>
              <Input
                {...register("usuario")}
                placeholder="Se completa con tu usuario de sesión"
                title="Se rellena automáticamente con la persona que tiene la sesión iniciada. Puedes editarlo si registras el cambio en nombre de otro."
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="costo-cambio">Costo (COP)</Label>
              <Input
                id="costo-cambio"
                type="number"
                min={0}
                step="0.01"
                placeholder="Ej: 150000 — se suma a los costos de mantenimiento"
                {...register("costo")}
              />
              <p className="text-xs text-muted-foreground">
                Los costos de cambios (mejoras, reparaciones no programadas) se
                suman a los costos de mantenimiento en reportes y KPIs.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {create ? "Registrar" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
