import { prisma } from "../../lib/prisma";
import type { ReporteGenerado, CreateReporteInput } from "./types";

export function listReportes(): Promise<ReporteGenerado[]> {
  return prisma.reportes_generados.findMany({ orderBy: { id: "desc" } }) as unknown as Promise<ReporteGenerado[]>;
}

export function createReporte(data: CreateReporteInput): Promise<ReporteGenerado> {
  const payload = {
    tipo_reporte: data.tipo_reporte,
    nombre_archivo: data.nombre_archivo,
    contenido_pdf: data.contenido_pdf ?? new Uint8Array(),
    generado_por: data.generado_por ?? "Sistema",
  };
  return prisma.reportes_generados.create({ data: payload });
}

export function deleteReporte(id: number): Promise<ReporteGenerado> {
  return prisma.reportes_generados.delete({ where: { id } });
}


