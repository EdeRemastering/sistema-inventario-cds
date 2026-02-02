import type { PrismaClient } from "@prisma/client";

export async function seedHistoricoMovimientos(prisma: PrismaClient) {
  console.log("🌱 Sembrando histórico de movimientos...");
  
  // Obtener algunos elementos y ubicaciones
  const elementos = await prisma.elementos.findMany({ take: 5 });
  const ubicaciones = await prisma.ubicaciones.findMany({ take: 3 });
  
  if (elementos.length === 0 || ubicaciones.length === 0) {
    console.log("⚠️  No hay elementos o ubicaciones disponibles para crear histórico");
    return;
  }
  
  let count = 0;
  const fechaBase = new Date();
  fechaBase.setMonth(fechaBase.getMonth() - 3); // Hace 3 meses
  
  for (let i = 0; i < elementos.length; i++) {
    const elemento = elementos[i];
    const ubicacionAnterior = ubicaciones[i % ubicaciones.length];
    const ubicacionNueva = ubicaciones[(i + 1) % ubicaciones.length];
    
    // Crear un movimiento histórico
    await prisma.historico_movimientos.create({
      data: {
        elemento_id: elemento.id,
        tipo_movimiento: "TRASLADO",
        fecha_movimiento: new Date(fechaBase.getTime() + i * 7 * 24 * 60 * 60 * 1000), // Espaciados por semana
        ubicacion_anterior_id: ubicacionAnterior.id,
        ubicacion_nueva_id: ubicacionNueva.id,
        observaciones: `Traslado histórico del elemento ${elemento.serie}`,
        usuario: "Sistema",
      },
    });
    count++;
  }
  
  console.log(`✅ ${count} movimientos históricos sembrados correctamente`);
}


