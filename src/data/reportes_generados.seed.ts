import type { PrismaClient } from "@prisma/client";

/** Un solo reporte de ejemplo. */
export const reportesSeed = [
  { id: 1, tipo_reporte: "inventario", nombre_archivo: "reporte_inventario_20250919_212138.pdf" },
];

export async function seedReportes(prisma: PrismaClient) {
  for (const r of reportesSeed) {
    await prisma.reportes_generados.upsert({
      where: { id: r.id },
      update: { tipo_reporte: r.tipo_reporte, nombre_archivo: r.nombre_archivo },
      create: { id: r.id, tipo_reporte: r.tipo_reporte, nombre_archivo: r.nombre_archivo, contenido_pdf: Buffer.from(""), generado_por: "Sistema" },
    });
  }
}
