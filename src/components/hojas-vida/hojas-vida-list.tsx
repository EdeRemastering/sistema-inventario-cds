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
import { HojaVidaUpsertDialog } from "./hoja-vida-upsert-dialog";
import { DeleteButton } from "../delete-button";
import type { HojaVida } from "../../modules/hojas_vida/types";

type SedeOption = { id: number; nombre: string; ciudad: string; municipio: string | null };
type UbicacionOption = { id: number; codigo: string; nombre: string; sede_id: number };
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
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Función para parsear fecha del servidor de forma segura (evita problemas de timezone)
const parseServerDate = (dateValue: Date | string | null | undefined): Date => {
  if (!dateValue) return new Date();
  
  const dateStr = typeof dateValue === 'string' 
    ? dateValue 
    : dateValue.toISOString();
  
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return new Date();
  
  const [, year, month, day] = match;
  // Crear fecha directamente sin hora para mostrar correctamente
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

type Props = {
  hojasVida: HojaVida[];
  elementos: ElementoOption[];
  sedes: SedeOption[];
  ubicaciones: UbicacionOption[];
  categorias: CategoriaOption[];
  subcategorias: SubcategoriaOption[];
  onCreateHojaVida: (formData: FormData) => Promise<void>;
  onUpdateHojaVida: (formData: FormData) => Promise<void>;
  onDeleteHojaVida: (id: number) => Promise<void>;
};

export function HojasVidaList({
  hojasVida,
  elementos,
  sedes,
  ubicaciones,
  categorias,
  subcategorias,
  onCreateHojaVida,
  onUpdateHojaVida,
  onDeleteHojaVida,
}: Props) {
  const [editingHojaVida, setEditingHojaVida] = useState<HojaVida | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hojas de Vida</h1>
        <HojaVidaUpsertDialog
          serverAction={onCreateHojaVida}
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
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha Diligenciamiento</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hojasVida.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay hojas de vida registradas
                </TableCell>
              </TableRow>
            ) : (
              hojasVida.map((hoja) => (
                <TableRow key={hoja.id}>
                  <TableCell>
                    {hoja.elemento
                      ? `${hoja.elemento.serie} - ${hoja.elemento.marca || ""} ${hoja.elemento.modelo || ""}`.trim()
                      : `Elemento ID: ${hoja.elemento_id}`}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      {hoja.tipo_elemento === "EQUIPO" ? "Equipo" : "Recurso Didáctico"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(parseServerDate(hoja.fecha_dilegenciamiento), "dd/MM/yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>{hoja.responsable || "N/A"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        hoja.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {hoja.activo ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingHojaVida(hoja)}
                      >
                        Editar
                      </Button>
                      <DeleteButton
                        onConfirm={() => onDeleteHojaVida(hoja.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingHojaVida && (
        <HojaVidaUpsertDialog
          serverAction={onUpdateHojaVida}
          create={false}
          defaultValues={editingHojaVida}
          elementos={elementos}
          sedes={sedes}
          ubicaciones={ubicaciones}
          categorias={categorias}
          subcategorias={subcategorias}
          hiddenFields={{ id: editingHojaVida.id }}
          onClose={() => setEditingHojaVida(null)}
        />
      )}
    </div>
  );
}

