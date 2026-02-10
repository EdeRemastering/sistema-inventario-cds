"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = {
  elementoId: number;
  elementoLabel: string;
  count: number;
  onConfirm: (formData: FormData) => Promise<void>;
  onClose: () => void;
};

const TIPOS = [
  { value: "PREVENTIVO", label: "Preventivo" },
  { value: "CORRECTIVO", label: "Correctivo" },
  { value: "PREDICTIVO", label: "Predictivo" },
] as const;

export function EditarTodosMantenimientosEquipoDialog({
  elementoId,
  elementoLabel,
  count,
  onConfirm,
  onClose,
}: Props) {
  const [tipo, setTipo] = useState<string>("CORRECTIVO");
  const [responsable, setResponsable] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("elemento_id", String(elementoId));
      formData.append("tipo", tipo);
      if (responsable.trim()) formData.append("responsable", responsable.trim());
      await onConfirm(formData);
      toast.success(
        `Se actualizó el tipo a ${TIPOS.find((t) => t.value === tipo)?.label ?? tipo} en ${count} mantenimiento(s)`
      );
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar todos los mantenimientos de este equipo</DialogTitle>
          <DialogDescription>
            Se aplicará el mismo tipo (y opcionalmente responsable) a los{" "}
            <strong>{count}</strong> mantenimiento(s) realizados del equipo{" "}
            <strong>{elementoLabel}</strong>. Puedes editar registros individuales
            después si necesitas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de mantenimiento</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulk-responsable">Responsable (opcional)</Label>
            <Input
              id="bulk-responsable"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              placeholder="Dejar vacío para no cambiar"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Aplicando..." : `Aplicar a ${count} registro(s)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
