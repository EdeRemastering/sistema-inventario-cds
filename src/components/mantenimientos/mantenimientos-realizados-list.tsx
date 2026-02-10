"use client";

import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { MantenimientoRealizadoUpsertDialog } from "./mantenimiento-realizado-upsert-dialog";
import { EditarTodosMantenimientosEquipoDialog } from "./editar-todos-mantenimientos-equipo-dialog";
import { DeleteButton } from "../delete-button";
import type { MantenimientoRealizado } from "../../modules/mantenimientos/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MoreHorizontal, Pencil, Layers } from "lucide-react";

type SedeOption = {
  id: number;
  nombre: string;
  ciudad: string;
  municipio: string | null;
};
type UbicacionOption = {
  id: number;
  codigo: string;
  nombre: string;
  sede_id: number;
};
type CategoriaOption = { id: number; nombre: string };
type SubcategoriaOption = { id: number; nombre: string; categoria_id: number };
type ElementoOption = {
  id: number;
  serie: string;
  marca: string | null;
  modelo: string | null;
  categoria_id: number;
  subcategoria_id: number | null;
  ubicacion_id: number | null;
  ubicacion_rel?: {
    id: number;
    codigo: string;
    nombre: string;
    sede?: {
      id: number;
      nombre: string;
      ciudad: string;
      municipio: string | null;
    } | null;
  } | null;
};

type Props = {
  mantenimientos: MantenimientoRealizado[];
  elementos: ElementoOption[];
  sedes: SedeOption[];
  ubicaciones: UbicacionOption[];
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  onCreateMantenimiento: (formData: FormData) => Promise<void>;
  onUpdateMantenimiento: (formData: FormData) => Promise<void>;
  onBulkUpdateByElemento?: (formData: FormData) => Promise<void>;
  onDeleteMantenimiento: (id: number) => Promise<void>;
};

function elementLabel(m: MantenimientoRealizado): string {
  if (m.elemento) {
    return `${m.elemento.serie}${m.elemento.marca ? ` - ${m.elemento.marca}` : ""}`.trim();
  }
  return `Elemento ${m.elemento_id}`;
}

export function MantenimientosRealizadosList({
  mantenimientos,
  elementos,
  sedes,
  ubicaciones,
  categorias,
  subcategorias,
  onCreateMantenimiento,
  onUpdateMantenimiento,
  onBulkUpdateByElemento,
  onDeleteMantenimiento,
}: Props) {
  const [editingMantenimiento, setEditingMantenimiento] =
    useState<MantenimientoRealizado | null>(null);
  const [filterElementoId, setFilterElementoId] = useState<string>("all");
  const [bulkEdit, setBulkEdit] = useState<{
    elemento_id: number;
    label: string;
    count: number;
  } | null>(null);

  const elementosConRealizados = useMemo(() => {
    const ids = new Set(mantenimientos.map((m) => m.elemento_id));
    return elementos.filter((e) => ids.has(e.id));
  }, [mantenimientos, elementos]);

  const mantenimientosFiltrados = useMemo(() => {
    if (filterElementoId === "all") return mantenimientos;
    const id = parseInt(filterElementoId, 10);
    return mantenimientos.filter((m) => m.elemento_id === id);
  }, [mantenimientos, filterElementoId]);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "PREVENTIVO":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:border dark:border-blue-700/50";
      case "CORRECTIVO":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 dark:border dark:border-orange-700/50";
      case "PREDICTIVO":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 dark:border dark:border-purple-700/50";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:border dark:border-gray-600/50";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">
          Mantenimientos Realizados
        </h1>
        <div data-tour="mantenimientos-realizados-create">
          <MantenimientoRealizadoUpsertDialog
            serverAction={onCreateMantenimiento}
            create={true}
            elementos={elementos}
            sedes={sedes}
            ubicaciones={ubicaciones}
            categorias={categorias}
            subcategorias={subcategorias}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-2 min-w-[220px]">
          <Label>Filtrar por equipo</Label>
          <Select value={filterElementoId} onValueChange={setFilterElementoId}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los equipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los equipos</SelectItem>
              {elementosConRealizados.map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.serie}
                  {e.marca ? ` - ${e.marca}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filterElementoId !== "all" && onBulkUpdateByElemento && mantenimientosFiltrados.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const id = parseInt(filterElementoId, 10);
              const first = mantenimientosFiltrados[0];
              setBulkEdit({
                elemento_id: id,
                label: elementLabel(first),
                count: mantenimientosFiltrados.length,
              });
            }}
            className="gap-2"
          >
            <Layers className="h-4 w-4" />
            Editar todos los mostrados ({mantenimientosFiltrados.length})
          </Button>
        )}
      </div>

      <div className="rounded-md border border-border bg-card dark:border-muted-foreground/30 dark:bg-card/95">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Elemento</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Costo</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mantenimientosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  {filterElementoId !== "all"
                    ? "No hay mantenimientos para este equipo"
                    : "No hay mantenimientos realizados"}
                </TableCell>
              </TableRow>
            ) : (
              mantenimientosFiltrados.map((mantenimiento, idx) => {
                const countEsteEquipo = mantenimientos.filter(
                  (m) => m.elemento_id === mantenimiento.elemento_id
                ).length;
                return (
                  <TableRow key={mantenimiento.id}>
                    <TableCell>
                      {mantenimiento.elemento
                        ? `${mantenimiento.elemento.serie} - ${
                            mantenimiento.elemento.marca || ""
                          } ${mantenimiento.elemento.modelo || ""}`.trim()
                        : `Elemento ID: ${mantenimiento.elemento_id}`}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(mantenimiento.fecha_mantenimiento),
                        "dd/MM/yyyy",
                        { locale: es }
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${getTipoColor(
                          mantenimiento.tipo
                        )}`}
                      >
                        {mantenimiento.tipo}
                      </span>
                    </TableCell>
                    <TableCell>{mantenimiento.responsable}</TableCell>
                    <TableCell>
                      {mantenimiento.costo
                        ? new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                          }).format(mantenimiento.costo)
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              data-tour={
                                idx === 0
                                  ? "mantenimientos-realizados-edit-first"
                                  : undefined
                              }
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              Acciones
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                setEditingMantenimiento(mantenimiento)
                              }
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar solo este
                            </DropdownMenuItem>
                            {onBulkUpdateByElemento &&
                              countEsteEquipo > 1 && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    setBulkEdit({
                                      elemento_id: mantenimiento.elemento_id,
                                      label: elementLabel(mantenimiento),
                                      count: countEsteEquipo,
                                    })
                                  }
                                >
                                  <Layers className="h-4 w-4 mr-2" />
                                  Editar todos los de este equipo (
                                  {countEsteEquipo})
                                </DropdownMenuItem>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <span
                          data-tour={
                            idx === 0
                              ? "mantenimientos-realizados-delete-first"
                              : undefined
                          }
                        >
                          <DeleteButton
                            onConfirm={() =>
                              onDeleteMantenimiento(mantenimiento.id)
                            }
                          />
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {editingMantenimiento && (
        <MantenimientoRealizadoUpsertDialog
          serverAction={onUpdateMantenimiento}
          create={false}
          defaultValues={editingMantenimiento}
          elementos={elementos}
          sedes={sedes}
          ubicaciones={ubicaciones}
          categorias={categorias}
          subcategorias={subcategorias}
          hiddenFields={{ id: editingMantenimiento.id }}
          onClose={() => setEditingMantenimiento(null)}
        />
      )}

      {bulkEdit && onBulkUpdateByElemento && (
        <EditarTodosMantenimientosEquipoDialog
          elementoId={bulkEdit.elemento_id}
          elementoLabel={bulkEdit.label}
          count={bulkEdit.count}
          onConfirm={onBulkUpdateByElemento}
          onClose={() => setBulkEdit(null)}
        />
      )}
    </div>
  );
}
