import type { PrismaClient } from "@prisma/client";

export async function seedMantenimientosProgramados(prisma: PrismaClient) {
  console.log("🌱 Sembrando mantenimientos programados...");
  
  // Obtener algunos elementos para asociar mantenimientos
  const elementos = await prisma.elementos.findMany({ take: 5 });
  
  if (elementos.length === 0) {
    console.log("⚠️  No hay elementos disponibles para crear mantenimientos programados");
    return;
  }
  
  const añoActual = new Date().getFullYear();
  let count = 0;
  
  for (const elemento of elementos) {
    // Verificar si ya existe un mantenimiento para este elemento y año
    const existing = await prisma.mantenimientos_programados.findFirst({
      where: {
        elemento_id: elemento.id,
        año: añoActual,
      },
    });
    
    if (existing) {
      // Actualizar si existe
      await prisma.mantenimientos_programados.update({
        where: { id: existing.id },
        data: {
          frecuencia: "MENSUAL",
          enero_semana1: true,
          febrero_semana1: true,
          marzo_semana1: true,
          abril_semana1: true,
          mayo_semana1: true,
          junio_semana1: true,
          julio_semana1: true,
          agosto_semana1: true,
          septiembre_semana1: true,
          octubre_semana1: true,
          noviembre_semana1: true,
          diciembre_semana1: true,
          estado: "PENDIENTE",
        },
      });
    } else {
      // Crear si no existe
      await prisma.mantenimientos_programados.create({
        data: {
          elemento_id: elemento.id,
          frecuencia: "MENSUAL",
          año: añoActual,
          enero_semana1: true,
          febrero_semana1: true,
          marzo_semana1: true,
          abril_semana1: true,
          mayo_semana1: true,
          junio_semana1: true,
          julio_semana1: true,
          agosto_semana1: true,
          septiembre_semana1: true,
          octubre_semana1: true,
          noviembre_semana1: true,
          diciembre_semana1: true,
          estado: "PENDIENTE",
          observaciones: "Mantenimiento preventivo mensual programado",
        },
      });
    }
    });
    count++;
  }
  
  console.log(`✅ ${count} mantenimientos programados sembrados correctamente`);
}

