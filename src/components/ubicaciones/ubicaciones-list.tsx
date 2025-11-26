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
import { UbicacionUpsertDialog } from "./ubicacion-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { Ubicacion } from "../../modules/ubicaciones/types";
import type { Sede } from "../../modules/sedes/types";

type Props = {
  ubicaciones: Ubicacion[];
  sedes: Sede[];
  onCreateUbicacion: (formData: FormData) => Promise<void>;
  onUpdateUbicacion: (formData: FormData) => Promise<void>;
  onDeleteUbicacion: (id: number) => Promise<void>;
};

export function UbicacionesList({
  ubicaciones,
  sedes,
  onCreateUbicacion,
  onUpdateUbicacion,
  onDeleteUbicacion,
}: Props) {
  const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ubicaciones</h1>
        <UbicacionUpsertDialog
          serverAction={onCreateUbicacion}
          create={true}
          sedes={sedes}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Sede</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ubicaciones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay ubicaciones registradas
                </TableCell>
              </TableRow>
            ) : (
              ubicaciones.map((ubicacion) => (
                <TableRow key={ubicacion.id}>
                  <TableCell className="font-medium">{ubicacion.codigo}</TableCell>
                  <TableCell>{ubicacion.nombre}</TableCell>
                  <TableCell>
                    {ubicacion.sede ? `${ubicacion.sede.nombre} - ${ubicacion.sede.ciudad}` : "N/A"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        ubicacion.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ubicacion.activo ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUbicacion(ubicacion)}
                      >
                        Editar
                      </Button>
                      <DeleteButton
                        onConfirm={() => onDeleteUbicacion(ubicacion.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingUbicacion && (
        <UbicacionUpsertDialog
          serverAction={onUpdateUbicacion}
          create={false}
          defaultValues={editingUbicacion}
          sedes={sedes}
          hiddenFields={{ id: editingUbicacion.id }}
          onClose={() => setEditingUbicacion(null)}
        />
      )}
    </div>
  );
}

