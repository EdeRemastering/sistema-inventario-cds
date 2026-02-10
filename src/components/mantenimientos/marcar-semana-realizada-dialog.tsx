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
} from "../ui/dialog";
import {
  SEMANAS_KEYS,
  getWeekLabel,
  getWeekKeyFromDate,
  isWeekProgrammed,
} from "@/lib/mantenimientos-semanas";
import type { MantenimientoProgramado } from "@/modules/mantenimientos/types";

type MantenimientoRealizadoConProgramacion = {
  id: number;
  programacion_id: number | null;
  fecha_mantenimiento: Date | string;
};

type Props = {
  programacion: MantenimientoProgramado;
  realizadosDeEstaProgramacion: MantenimientoRealizadoConProgramacion[];
  onConfirm: (weekKey: string) => Promise<void>;
  onClose: () => void;
};

export function MarcarSemanaRealizadaDialog({
  programacion,
  realizadosDeEstaProgramacion,
  onConfirm,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  const semanasProgramadas = SEMANAS_KEYS.filter((key) =>
    isWeekProgrammed(programacion as unknown as Record<string, unknown>, key)
  );

  function yaEjecutada(weekKey: string): boolean {
    return realizadosDeEstaProgramacion.some((r) => {
      if (r.programacion_id !== programacion.id) return false;
      const fecha =
        typeof r.fecha_mantenimiento === "string"
          ? new Date(r.fecha_mantenimiento)
          : r.fecha_mantenimiento;
      return getWeekKeyFromDate(fecha) === weekKey;
    });
  }

  const handleConfirm = async () => {
    if (!selectedWeek) {
      toast.error("Seleccione una semana");
      return;
    }
    if (yaEjecutada(selectedWeek)) {
      toast.error("Esa semana ya fue marcada como ejecutada");
      return;
    }
    setLoading(true);
    try {
      await onConfirm(selectedWeek);
      toast.success(
        `Semana ${getWeekLabel(selectedWeek)} marcada como ejecutada`
      );
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al marcar la semana");
    } finally {
      setLoading(false);
    }
  };

  if (semanasProgramadas.length === 0) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar semana como ejecutada</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            No hay semanas programadas para este mantenimiento. Edite la
            programación y marque al menos una semana.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>¿Qué semana marcar como ejecutada?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Seleccione solo la semana en la que realizó el mantenimiento. Así no
          se marcan todas las semanas del elemento.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto py-2">
          {semanasProgramadas.map((weekKey) => {
            const ejecutada = yaEjecutada(weekKey);
            return (
              <Button
                key={weekKey}
                type="button"
                variant={selectedWeek === weekKey ? "default" : "outline"}
                size="sm"
                className="justify-start"
                disabled={ejecutada}
                onClick={() => !ejecutada && setSelectedWeek(weekKey)}
              >
                {getWeekLabel(weekKey)}
                {ejecutada && (
                  <span className="ml-2 text-xs opacity-80">
                    (ya ejecutada)
                  </span>
                )}
              </Button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedWeek || loading}>
            {loading ? "Guardando..." : "Marcar esta semana como ejecutada"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
