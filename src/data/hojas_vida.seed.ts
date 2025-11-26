import type { PrismaClient } from "@prisma/client";

export async function seedHojasVida(prisma: PrismaClient) {
  console.log("🌱 Sembrando hojas de vida...");
  
  // Obtener algunos elementos
  const elementos = await prisma.elementos.findMany({ take: 5 });
  
  if (elementos.length === 0) {
    console.log("⚠️  No hay elementos disponibles para crear hojas de vida");
    return;
  }
  
  let count = 0;
  
  for (const elemento of elementos) {
    // Verificar si ya existe una hoja de vida activa para este elemento
    const existing = await prisma.hojas_vida.findFirst({
      where: {
        elemento_id: elemento.id,
        activo: true,
      },
    });
    
    if (existing) {
      continue; // Ya existe una hoja de vida activa
    }
    
    // Crear hoja de vida
    await prisma.hojas_vida.create({
      data: {
        elemento_id: elemento.id,
        fecha_dilegenciamiento: new Date(),
        tipo_elemento: "EQUIPO",
        area_ubicacion: elemento.ubicacion || "Sala de Sistemas",
        responsable: "Administrador del Sistema",
        especificaciones_tecnicas: {
          marca: elemento.marca,
          modelo: elemento.modelo,
          serie: elemento.serie,
        },
        descripcion: `Hoja de vida del elemento ${elemento.serie}`,
        requerimientos_funcionamiento: "Funcionamiento normal según especificaciones del fabricante",
        requerimientos_seguridad: "Cumplir con normas de seguridad establecidas",
        rutina_mantenimiento: "MENSUAL",
        fecha_actualizacion: new Date(),
        activo: true,
      },
    });
    count++;
  }
  
  console.log(`✅ ${count} hojas de vida sembradas correctamente`);
}

