import type { PrismaClient } from "@prisma/client";

/** Ubicaciones mínimas: 2 por sede (6 total) para presentación. */
export const ubicacionesSeed = [
  { codigo: "APART-SIS-001", nombre: "SALA DE SISTEMAS N°1", sede_nombre: "APARTADÓ", activo: true },
  { codigo: "APART-AUD-001", nombre: "AUDITORIO PRINCIPAL", sede_nombre: "APARTADÓ", activo: true },
  { codigo: "APART-ADM-001", nombre: "OFICINAS ADMINISTRATIVAS", sede_nombre: "APARTADÓ", activo: true },
  { codigo: "TURBO-SIS-001", nombre: "SALA DE SISTEMAS", sede_nombre: "TURBO", activo: true },
  { codigo: "TURBO-BIB-001", nombre: "BIBLIOTECA", sede_nombre: "TURBO", activo: true },
  { codigo: "TURBO-ADM-001", nombre: "OFICINAS", sede_nombre: "TURBO", activo: true },
];

export async function seedUbicaciones(prisma: PrismaClient) {
  console.log("🌱 Sembrando ubicaciones...");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sedes = await (prisma as any).sedes.findMany();
  const sedesMap = new Map(sedes.map((s: { nombre: string; id: number }) => [s.nombre, s.id]));
  let count = 0;
  for (const ubicacion of ubicacionesSeed) {
    const sedeId = sedesMap.get(ubicacion.sede_nombre);
    if (!sedeId) {
      console.warn(`⚠️  Sede "${ubicacion.sede_nombre}" no encontrada para ubicación ${ubicacion.codigo}`);
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.ubicaciones as any).upsert({
      where: { codigo: ubicacion.codigo },
      update: { nombre: ubicacion.nombre, sede_id: sedeId, activo: ubicacion.activo },
      create: {
        codigo: ubicacion.codigo,
        nombre: ubicacion.nombre,
        sede_id: sedeId,
        activo: ubicacion.activo,
      },
    });
    count++;
  }
  console.log(`✅ ${count} ubicaciones sembradas correctamente`);
}
