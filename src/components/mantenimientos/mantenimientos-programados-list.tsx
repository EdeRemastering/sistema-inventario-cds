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
import { MantenimientoProgramadoUpsertDialog } from "./mantenimiento-programado-upsert-dialog";
import { DeleteButton } from "../delete-button";
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
}: Props) {
  const [editingMantenimiento, setEditingMantenimiento] = useState<MantenimientoProgramado | null>(null);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800";
      case "REALIZADO":
        return "bg-green-100 text-green-800";
      case "APLAZADO":
        return "bg-orange-100 text-orange-800";
      case "CANCELADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mantenimientos Programados</h1>
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
              <TableHead>Acciones</TableHead>
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
              mantenimientos.map((mantenimiento) => (
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
                      className={`px-2 py-1 rounded text-xs ${getEstadoColor(mantenimiento.estado)}`}
                    >
                      {mantenimiento.estado}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMantenimiento(mantenimiento)}
                      >
                        Editar
                      </Button>
                      <DeleteButton
                        onConfirm={() => onDeleteMantenimiento(mantenimiento.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
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

