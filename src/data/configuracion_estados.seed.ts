import type { PrismaClient } from "@prisma/client";

export const configuracionEstadosSeed = [
  // Estados Funcionales
  { tipo: "FUNCIONAL", codigo: "B", nombre: "Bueno", descripcion: "Elemento en buen estado funcional" },
  { tipo: "FUNCIONAL", codigo: "D", nombre: "Deficiente", descripcion: "Elemento con deficiencias funcionales" },
  { tipo: "FUNCIONAL", codigo: "I", nombre: "Inservible", descripcion: "Elemento no funcional" },
  { tipo: "FUNCIONAL", codigo: "FS", nombre: "Fuera de Servicio", descripcion: "Elemento fuera de servicio temporalmente" },
  { tipo: "FUNCIONAL", codigo: "O", nombre: "Óptimo", descripcion: "Elemento en estado óptimo" },
  { tipo: "FUNCIONAL", codigo: "R", nombre: "Regular", descripcion: "Elemento en estado regular" },
  { tipo: "FUNCIONAL", codigo: "OB", nombre: "Óptimo Bueno", descripcion: "Elemento entre óptimo y bueno" },
  
  // Estados Físicos
  { tipo: "FISICO", codigo: "B", nombre: "Bueno", descripcion: "Elemento en buen estado físico" },
  { tipo: "FISICO", codigo: "D", nombre: "Deficiente", descripcion: "Elemento con deficiencias físicas" },
  { tipo: "FISICO", codigo: "I", nombre: "Inservible", descripcion: "Elemento físicamente inservible" },
  { tipo: "FISICO", codigo: "FS", nombre: "Fuera de Servicio", descripcion: "Elemento fuera de servicio por estado físico" },
  { tipo: "FISICO", codigo: "O", nombre: "Óptimo", descripcion: "Elemento en estado físico óptimo" },
  { tipo: "FISICO", codigo: "R", nombre: "Regular", descripcion: "Elemento en estado físico regular" },
  { tipo: "FISICO", codigo: "OB", nombre: "Óptimo Bueno", descripcion: "Elemento entre óptimo y bueno físicamente" },
];

export async function seedConfiguracionEstados(prisma: PrismaClient) {
  console.log("🌱 Sembrando configuración de estados...");
  
  for (const estado of configuracionEstadosSeed) {
    await prisma.configuracion_estados.upsert({
      where: {
        tipo_codigo: {
          tipo: estado.tipo,
          codigo: estado.codigo,
        },
      },
      update: {
        nombre: estado.nombre,
        descripcion: estado.descripcion,
      },
      create: {
        tipo: estado.tipo,
        codigo: estado.codigo,
        nombre: estado.nombre,
        descripcion: estado.descripcion,
      },
    });
  }
  
  console.log(`✅ ${configuracionEstadosSeed.length} estados de configuración sembrados correctamente`);
}


