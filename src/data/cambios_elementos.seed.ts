import type { PrismaClient } from "@prisma/client";

export async function seedCambiosElementos(prisma: PrismaClient) {
  console.log("🌱 Sembrando cambios de elementos...");
  
  // Obtener algunas hojas de vida
  const hojasVida = await prisma.hojas_vida.findMany({ take: 3 });
  
  if (hojasVida.length === 0) {
    console.log("⚠️  No hay hojas de vida disponibles para crear cambios");
    return;
  }
  
  let count = 0;
  
  for (const hojaVida of hojasVida) {
    // Crear un cambio de ejemplo para cada hoja de vida
    await prisma.cambios_elementos.create({
      data: {
        hoja_vida_id: hojaVida.id,
        fecha_cambio: new Date(),
        descripcion_cambio: "Actualización de información técnica del elemento",
        tipo_cambio: "ACTUALIZACION",
        usuario: "Sistema",
      },
    });
    count++;
  }
  
  console.log(`✅ ${count} cambios de elementos sembrados correctamente`);
}

