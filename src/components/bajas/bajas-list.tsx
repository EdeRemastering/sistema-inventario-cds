"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { BajaElemento } from "../../modules/bajas_elementos/types";

type Props = {
  bajas: BajaElemento[];
};

export function BajasList({ bajas }: Props) {
  if (bajas.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground">
        No hay bajas registradas
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Elemento</TableHead>
            <TableHead>Fecha baja</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Autorizado por</TableHead>
            <TableHead>Evidencia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bajas.map((b) => (
            <TableRow key={b.id}>
              <TableCell>
                {b.elemento
                  ? `${b.elemento.serie} - ${b.elemento.marca ?? ""} ${b.elemento.modelo ?? ""}`.trim()
                  : `ID: ${b.elemento_id}`}
              </TableCell>
              <TableCell>
                {b.fecha_baja instanceof Date
                  ? b.fecha_baja.toLocaleDateString("es-CO")
                  : new Date(b.fecha_baja).toLocaleDateString("es-CO")}
              </TableCell>
              <TableCell className="max-w-[200px] truncate" title={b.motivo}>
                {b.motivo}
              </TableCell>
              <TableCell>
                {b.autorizador
                  ? `${b.autorizador.nombre} ${b.autorizador.apellido ?? ""}`.trim()
                  : "-"}
              </TableCell>
              <TableCell>
                {b.evidencia_pdf_url ? (
                  <a
                    href={b.evidencia_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Ver PDF
                  </a>
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
