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
import { MantenimientoRealizadoUpsertDialog } from "./mantenimiento-realizado-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { MantenimientoRealizado } from "../../modules/mantenimientos/types";
import type { Elemento } from "../../modules/elementos/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Props = {
  mantenimientos: MantenimientoRealizado[];
  elementos: Elemento[];
  onCreateMantenimiento: (formData: FormData) => Promise<void>;
  onUpdateMantenimiento: (formData: FormData) => Promise<void>;
  onDeleteMantenimiento: (id: number) => Promise<void>;
};

export function MantenimientosRealizadosList({
  mantenimientos,
  elementos,
  onCreateMantenimiento,
  onUpdateMantenimiento,
  onDeleteMantenimiento,
}: Props) {
  const [editingMantenimiento, setEditingMantenimiento] = useState<MantenimientoRealizado | null>(null);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "PREVENTIVO":
        return "bg-blue-100 text-blue-800";
      case "CORRECTIVO":
        return "bg-orange-100 text-orange-800";
      case "PREDICTIVO":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mantenimientos Realizados</h1>
        <MantenimientoRealizadoUpsertDialog
          serverAction={onCreateMantenimiento}
          create={true}
          elementos={elementos}
        />
      </div>

      <div className="rounded-md border">
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
            {mantenimientos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay mantenimientos realizados
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
                  <TableCell>
                    {format(new Date(mantenimiento.fecha_mantenimiento), "dd/MM/yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getTipoColor(mantenimiento.tipo)}`}
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
        <MantenimientoRealizadoUpsertDialog
          serverAction={onUpdateMantenimiento}
          create={false}
          defaultValues={editingMantenimiento}
          elementos={elementos}
          hiddenFields={{ id: editingMantenimiento.id }}
          onClose={() => setEditingMantenimiento(null)}
        />
      )}
    </div>
  );
}

