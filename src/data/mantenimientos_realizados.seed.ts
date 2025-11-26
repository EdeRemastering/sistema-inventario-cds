import type { PrismaClient } from "@prisma/client";

export async function seedMantenimientosRealizados(prisma: PrismaClient) {
  console.log("🌱 Sembrando mantenimientos realizados...");
  
  // Obtener algunos elementos y mantenimientos programados
  const elementos = await prisma.elementos.findMany({ take: 3 });
  const programaciones = await prisma.mantenimientos_programados.findMany({ take: 3 });
  
  if (elementos.length === 0) {
    console.log("⚠️  No hay elementos disponibles para crear mantenimientos realizados");
    return;
  }
  
  let count = 0;
  const fechaActual = new Date();
  
  for (let i = 0; i < elementos.length; i++) {
    const elemento = elementos[i];
    const programacion = programaciones[i] || null;
    
    // Crear un mantenimiento realizado para cada elemento
    await prisma.mantenimientos_realizados.create({
      data: {
        elemento_id: elemento.id,
        programacion_id: programacion?.id || null,
        fecha_mantenimiento: new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 15),
        tipo: "PREVENTIVO",
        descripcion: `Mantenimiento preventivo realizado al elemento ${elemento.serie}`,
        averias_encontradas: null,
        repuestos_utilizados: null,
        responsable: "Técnico de Mantenimiento",
        costo: 50000 + Math.random() * 100000,
        creado_por: "Sistema",
      },
    });
    count++;
  }
  
  console.log(`✅ ${count} mantenimientos realizados sembrados correctamente`);
}

