import { PrismaClient } from "@prisma/client";
import { seedSedes } from "../src/data/sedes.seed";
import { seedUbicaciones } from "../src/data/ubicaciones.seed";
import { seedConfiguracionEstados } from "../src/data/configuracion_estados.seed";
import { seedConfiguracionFrecuencias } from "../src/data/configuracion_frecuencias.seed";
import { seedCategorias } from "../src/data/categorias.seed";
import { seedSubcategorias } from "../src/data/subcategorias.seed";
import { seedUsuarios } from "../src/data/usuarios.seed";
import { seedElementos } from "../src/data/elementos.seed";
import { seedMovimientos } from "../src/data/movimientos.seed";
import { seedLogs } from "../src/data/logs.seed";
import { seedObservaciones } from "../src/data/observaciones.seed";
import { seedReportes } from "../src/data/reportes_generados.seed";
import { seedTickets } from "../src/data/tickets_guardados.seed";
import { seedTicketElementos } from "../src/data/ticket_elementos.seed";
import { seedMantenimientosProgramados } from "../src/data/mantenimientos_programados.seed";
import { seedMantenimientosRealizados } from "../src/data/mantenimientos_realizados.seed";
import { seedHojasVida } from "../src/data/hojas_vida.seed";
import { seedCambiosElementos } from "../src/data/cambios_elementos.seed";
import { seedHistoricoMovimientos } from "../src/data/historico_movimientos.seed";
import { seedNotifications } from "../src/data/notifications.seed";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Iniciando proceso de seed...\n");
  
  // 1. Configuraciones básicas (sin dependencias)
  await seedConfiguracionEstados(prisma);
  await seedConfiguracionFrecuencias(prisma);
  
  // 2. Sedes (sin dependencias)
  await seedSedes(prisma);
  
  // 3. Ubicaciones (depende de sedes)
  await seedUbicaciones(prisma);
  
  // 4. Categorías y subcategorías
  await seedCategorias(prisma);
  await seedSubcategorias(prisma);
  
  // 5. Usuarios
  await seedUsuarios(prisma);
  
  // 6. Elementos (depende de categorías, subcategorías, ubicaciones)
  await seedElementos(prisma);
  
  // 7. Movimientos (depende de elementos)
  await seedMovimientos(prisma);
  await seedHistoricoMovimientos(prisma);
  
  // 8. Tickets (depende de elementos)
  await seedTickets(prisma);
  await seedTicketElementos(prisma);
  
  // 9. Mantenimientos (depende de elementos)
  await seedMantenimientosProgramados(prisma);
  await seedMantenimientosRealizados(prisma);
  
  // 10. Hojas de vida (depende de elementos)
  await seedHojasVida(prisma);
  await seedCambiosElementos(prisma);
  
  // 11. Otros
  await seedLogs(prisma);
  await seedObservaciones();
  await seedReportes(prisma);
  await seedNotifications(prisma);
  
  console.log("\n✅ Proceso de seed completado exitosamente!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


