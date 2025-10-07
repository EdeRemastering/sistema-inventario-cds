import { PrismaClient } from "../src/generated/prisma";
import { seedCategorias } from "../src/data/categorias.seed";
import { seedSubcategorias } from "../src/data/subcategorias.seed";
import { seedUsuarios } from "../src/data/usuarios.seed";
import { seedElementos } from "../src/data/elementos.seed";
import { seedMovimientos } from "../src/data/movimientos.seed";
import { seedLogs } from "../src/data/logs.seed";
import { seedObservaciones } from "../src/data/observaciones.seed";
import { seedReportes } from "../src/data/reportes_generados.seed";
import { seedTickets } from "../src/data/tickets_guardados.seed";

const prisma = new PrismaClient();

async function main() {
  await seedCategorias(prisma);
  await seedSubcategorias(prisma);
  await seedUsuarios(prisma);
  await seedElementos(prisma);
  await seedMovimientos(prisma);
  await seedLogs(prisma);
  await seedObservaciones(prisma);
  await seedReportes(prisma);
  await seedTickets(prisma);
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


