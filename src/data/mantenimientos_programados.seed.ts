import type { PrismaClient } from "@prisma/client";

export async function seedMantenimientosProgramados(prisma: PrismaClient) {
  console.log("🌱 Sembrando mantenimientos programados...");

  const elementos = await prisma.elementos.findMany({ take: 2 });

  if (elementos.length === 0) {
    console.log("⚠️  No hay elementos disponibles para crear mantenimientos programados");
    return;
  }

  const añoActual = new Date().getFullYear();
  let count = 0;

  for (const elemento of elementos) {
    // Crear un mantenimiento programado por mes (primera semana de cada mes)
    for (let mes = 0; mes < 12; mes++) {
      const fechaMantenimiento = new Date(añoActual, mes, 1);
      fechaMantenimiento.setHours(0, 0, 0, 0);

      const existing = await prisma.mantenimientos_programados.findFirst({
        where: {
          elemento_id: elemento.id,
          fecha_mantenimiento: fechaMantenimiento,
        },
      });

      if (existing) {
        await prisma.mantenimientos_programados.update({
          where: { id: existing.id },
          data: {
            descripcion: `Mantenimiento preventivo mensual - ${fechaMantenimiento.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}`,
            estado: "PENDIENTE",
            observaciones: "Mantenimiento preventivo mensual programado",
          },
        });
      } else {
        await prisma.mantenimientos_programados.create({
          data: {
            elemento_id: elemento.id,
            fecha_mantenimiento: fechaMantenimiento,
            tipo: "PREVENTIVO",
            descripcion: `Mantenimiento preventivo mensual - ${fechaMantenimiento.toLocaleDateString("es-CO", { month: "long", year: "numeric" })}`,
            averias_encontradas: null,
            repuestos_utilizados: null,
            responsable: "Sistema",
            costo: null,
            estado: "PENDIENTE",
            observaciones: "Mantenimiento preventivo mensual programado",
            creado_por: null,
          },
        });
      }
      count++;
    }
  }

  console.log(`✅ ${count} mantenimientos programados sembrados correctamente`);
}
