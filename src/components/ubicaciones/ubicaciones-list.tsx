"use client";

import { useState } from "react";
import { Package2 } from "lucide-react";
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
import { UbicacionElementosSheet } from "./ubicacion-elementos-sheet";
import { DeleteButton } from "../delete-button";
import type { Ubicacion } from "../../modules/ubicaciones/types";
import type { Sede } from "../../modules/sedes/types";
import type { Categoria } from "../../modules/categorias/types";
import type { Subcategoria } from "../../modules/subcategorias/types";

type Props = {
  ubicaciones: Ubicacion[];
  sedes: Sede[];
  categorias: Categoria[];
  subcategorias: Subcategoria[];
  onCreateUbicacion: (formData: FormData) => Promise<void>;
  onUpdateUbicacion: (formData: FormData) => Promise<void>;
  onDeleteUbicacion: (id: number) => Promise<void>;
  onCreateElemento: (formData: FormData) => Promise<void>;
  onUpdateElemento: (formData: FormData) => Promise<void>;
  onDeleteElemento: (id: number) => Promise<void>;
};

export function UbicacionesList({
  ubicaciones,
  sedes,
  categorias,
  subcategorias,
  onCreateUbicacion,
  onUpdateUbicacion,
  onDeleteUbicacion,
  onCreateElemento,
  onUpdateElemento,
  onDeleteElemento,
}: Props) {
  const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(
    null
  );
  const [elementosSheetUbicacion, setElementosSheetUbicacion] =
    useState<Ubicacion | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" data-tour="page-title">
          Ubicaciones
        </h1>
        <div data-tour="ubicaciones-create">
          <UbicacionUpsertDialog
            serverAction={onCreateUbicacion}
            create={true}
            sedes={sedes}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Sede</TableHead>
              <TableHead>Dimensiones</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ubicaciones.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No hay ubicaciones registradas
                </TableCell>
              </TableRow>
            ) : (
              ubicaciones.map((ubicacion, idx) => (
                <TableRow key={ubicacion.id}>
                  <TableCell className="font-medium">
                    {ubicacion.codigo}
                  </TableCell>
                  <TableCell>{ubicacion.nombre}</TableCell>
                  <TableCell>
                    {ubicacion.sede
                      ? `${ubicacion.sede.nombre} - ${ubicacion.sede.ciudad}`
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ubicacion.ancho_metros != null &&
                    ubicacion.largo_metros != null
                      ? `${ubicacion.ancho_metros} × ${ubicacion.largo_metros} m`
                      : "-"}
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
                        onClick={() => setElementosSheetUbicacion(ubicacion)}
                        title="Ver y agregar elementos"
                      >
                        <Package2 className="h-4 w-4 mr-1" />
                        Elementos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUbicacion(ubicacion)}
                        data-tour={
                          idx === 0 ? "ubicaciones-edit-first" : undefined
                        }
                      >
                        Editar
                      </Button>
                      <span
                        data-tour={
                          idx === 0 ? "ubicaciones-delete-first" : undefined
                        }
                      >
                        <DeleteButton
                          tourId={
                            idx === 0 ? "ubicaciones-delete-first" : undefined
                          }
                          onConfirm={() => onDeleteUbicacion(ubicacion.id)}
                        />
                      </span>
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

      <UbicacionElementosSheet
        open={elementosSheetUbicacion !== null}
        onOpenChange={(open) => !open && setElementosSheetUbicacion(null)}
        ubicacion={elementosSheetUbicacion}
        sedes={sedes}
        categorias={categorias}
        subcategorias={subcategorias}
        ubicaciones={ubicaciones}
        onCreateElemento={onCreateElemento}
        onUpdateElemento={onUpdateElemento}
        onDeleteElemento={onDeleteElemento}
      />
    </div>
  );
}
