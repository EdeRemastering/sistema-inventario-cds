import type { PrismaClient } from "@prisma/client";

/** Sedes mínimas para presentación (2 sedes). */
export const sedesSeed = [
  { nombre: "APARTADÓ", ciudad: "Apartadó", municipio: "Apartadó", activo: true },
  { nombre: "TURBO", ciudad: "Turbo", municipio: "Turbo", activo: true },
];

export async function seedSedes(prisma: PrismaClient) {
  console.log("🌱 Sembrando sedes...");
  for (const sede of sedesSeed) {
    await prisma.sedes.upsert({
      where: { nombre: sede.nombre },
      update: { ciudad: sede.ciudad, municipio: sede.municipio, activo: sede.activo },
      create: {
        nombre: sede.nombre,
        ciudad: sede.ciudad,
        municipio: sede.municipio,
        activo: sede.activo,
      },
    });
  }
  console.log(`✅ ${sedesSeed.length} sedes sembradas correctamente`);
}
