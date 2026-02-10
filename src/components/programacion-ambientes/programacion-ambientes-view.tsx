"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { ProgramacionAmbienteUpsertDialog } from "./programacion-ambiente-upsert-dialog";
import {
  actionCreateProgramacionAmbiente,
  actionUpdateProgramacionAmbiente,
  actionDeleteProgramacionAmbiente,
} from "../../modules/programacion_ambientes/actions";
import type { ProgramacionAmbiente } from "../../modules/programacion_ambientes/types";
import type { UbicacionOption } from "../../lib/form-options";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";

type Props = {
  programaciones: ProgramacionAmbiente[];
  ubicaciones: UbicacionOption[];
};

export function ProgramacionAmbientesView({ programaciones, ubicaciones }: Props) {
  const [ubicacionFiltro, setUbicacionFiltro] = useState<string>("");
  const [fechaFiltro, setFechaFiltro] = useState<string>("");
  const [editing, setEditing] = useState<ProgramacionAmbiente | null>(null);

  const filtradas = useMemo(() => {
    let list = programaciones;
    if (ubicacionFiltro) {
      list = list.filter((p) => p.ubicacion_id.toString() === ubicacionFiltro);
    }
    if (fechaFiltro) {
      const d = new Date(fechaFiltro);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      list = list.filter((p) => {
        const fd = new Date(p.fecha);
        return fd >= start && fd <= end;
      });
    }
    return list;
  }, [programaciones, ubicacionFiltro, fechaFiltro]);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta programación?")) return;
    try {
      await actionDeleteProgramacionAmbiente(id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="grid gap-1">
          <Label>Ubicación</Label>
          <Select value={ubicacionFiltro} onValueChange={setUbicacionFiltro}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {ubicaciones.map((u) => (
                <SelectItem key={u.id} value={u.id.toString()}>
                  {u.codigo} - {u.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label>Fecha</Label>
          <Input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="w-[180px]"
          />
        </div>
        <div className="ml-auto">
          <ProgramacionAmbienteUpsertDialog
            serverAction={actionCreateProgramacionAmbiente}
            ubicaciones={ubicaciones}
          />
        </div>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ambiente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora inicio</TableHead>
              <TableHead>Hora fin</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Docente (Q10)</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay programaciones registradas
                </TableCell>
              </TableRow>
            ) : (
              filtradas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.ubicacion
                      ? `${p.ubicacion.codigo} - ${p.ubicacion.nombre}`
                      : `ID ${p.ubicacion_id}`}
                  </TableCell>
                  <TableCell>
                    {p.fecha instanceof Date
                      ? p.fecha.toLocaleDateString("es-CO")
                      : new Date(p.fecha).toLocaleDateString("es-CO")}
                  </TableCell>
                  <TableCell>{p.hora_inicio}</TableCell>
                  <TableCell>{p.hora_fin}</TableCell>
                  <TableCell>
                    <Badge variant={p.ocupado ? "destructive" : "secondary"}>
                      {p.ocupado ? "Ocupado" : "Disponible"}
                    </Badge>
                  </TableCell>
                  <TableCell>{p.docente_id_q10 ?? "-"}</TableCell>
                  <TableCell className="max-w-[180px] truncate" title={p.descripcion ?? ""}>
                    {p.descripcion ?? "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditing(p)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <ProgramacionAmbienteUpsertDialog
          serverAction={actionUpdateProgramacionAmbiente}
          ubicaciones={ubicaciones}
          defaultValues={editing}
          create={false}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
