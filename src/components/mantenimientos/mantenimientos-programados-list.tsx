"use client";

import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { MantenimientoProgramadoUpsertDialog } from "./mantenimiento-programado-upsert-dialog";
import { DeleteButton } from "../delete-button";
import { Check, Clock, MoreHorizontal, Pencil, RotateCcw, X } from "lucide-react";
import type { MantenimientoProgramado } from "../../modules/mantenimientos/types";
import type { ElementoWithRelations } from "../../modules/elementos/types";
import type { Sede } from "../../modules/sedes/types";
import type { Ubicacion } from "../../modules/ubicaciones/types";
import type { Categoria } from "../../modules/categorias/types";
import type { Subcategoria } from "../../modules/subcategorias/types";

type Props = {
  mantenimientos: MantenimientoProgramado[];
  elementos: ElementoWithRelations[];
  sedes: Sede[];
  ubicaciones: Ubicacion[];
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  onCreateMantenimiento: (formData: FormData) => Promise<void>;
  onUpdateMantenimiento: (formData: FormData) => Promise<void>;
  onDeleteMantenimiento: (id: number) => Promise<void>;
  onCambiarEstado?: (id: number, estado: "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO") => Promise<void>;
};

export function MantenimientosProgramadosList({
  mantenimientos,
  elementos,
  sedes,
  ubicaciones,
  categorias,
  subcategorias,
  onCreateMantenimiento,
  onUpdateMantenimiento,
  onDeleteMantenimiento,
  onCambiarEstado,
}: Props) {
  const [editingMantenimiento, setEditingMantenimiento] = useState<MantenimientoProgramado | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "REALIZADO":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400";
      case "APLAZADO":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "CANCELADO":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleCambiarEstado = async (id: number, estado: "PENDIENTE" | "REALIZADO" | "APLAZADO" | "CANCELADO") => {
    if (!onCambiarEstado) return;
    setLoadingId(id);
    try {
      await onCambiarEstado(id, estado);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Mantenimientos Programados</h2>
          <p className="text-sm text-muted-foreground">
            {mantenimientos.filter(m => m.estado === "PENDIENTE").length} pendientes de {mantenimientos.length} total
          </p>
        </div>
        <MantenimientoProgramadoUpsertDialog
          serverAction={onCreateMantenimiento}
          create={true}
          elementos={elementos}
          sedes={sedes}
          ubicaciones={ubicaciones}
          categorias={categorias}
          subcategorias={subcategorias}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Elemento</TableHead>
              <TableHead>Frecuencia</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mantenimientos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay mantenimientos programados
                </TableCell>
              </TableRow>
            ) : (
              mantenimientos.map((mantenimiento) => {
                const isLoading = loadingId === mantenimiento.id;
                
                return (
                  <TableRow key={mantenimiento.id}>
                    <TableCell>
                      {mantenimiento.elemento
                        ? `${mantenimiento.elemento.serie} - ${mantenimiento.elemento.marca || ""} ${mantenimiento.elemento.modelo || ""}`.trim()
                        : `Elemento ID: ${mantenimiento.elemento_id}`}
                    </TableCell>
                    <TableCell>{mantenimiento.frecuencia}</TableCell>
                    <TableCell>{mantenimiento.año}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(mantenimiento.estado)}`}
                      >
                        {mantenimiento.estado}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Botones de acción rápida */}
                        {mantenimiento.estado === "PENDIENTE" && onCambiarEstado && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
                              disabled={isLoading}
                              onClick={() => handleCambiarEstado(mantenimiento.id, "REALIZADO")}
                              title="Marcar como realizado"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={isLoading}
                              onClick={() => handleCambiarEstado(mantenimiento.id, "APLAZADO")}
                              title="Marcar como aplazado"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {/* Menú de más opciones */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={isLoading}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingMantenimiento(mantenimiento)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            
                            {onCambiarEstado && (
                              <>
                                <DropdownMenuSeparator />
                                {mantenimiento.estado !== "REALIZADO" && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCambiarEstado(mantenimiento.id, "REALIZADO")}
                                    className="text-cyan-600"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Marcar Realizado
                                  </DropdownMenuItem>
                                )}
                                {mantenimiento.estado !== "APLAZADO" && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCambiarEstado(mantenimiento.id, "APLAZADO")}
                                    className="text-red-600"
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Marcar Aplazado
                                  </DropdownMenuItem>
                                )}
                                {mantenimiento.estado !== "PENDIENTE" && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCambiarEstado(mantenimiento.id, "PENDIENTE")}
                                    className="text-yellow-600"
                                  >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Restaurar a Pendiente
                                  </DropdownMenuItem>
                                )}
                                {mantenimiento.estado !== "CANCELADO" && (
                                  <DropdownMenuItem 
                                    onClick={() => handleCambiarEstado(mantenimiento.id, "CANCELADO")}
                                    className="text-gray-600"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <DeleteButton
                                onConfirm={() => onDeleteMantenimiento(mantenimiento.id)}
                                variant="ghost"
                                className="w-full justify-start text-destructive hover:text-destructive cursor-pointer"
                              />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        <MantenimientoProgramadoUpsertDialog
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
    </div>
  );
}
