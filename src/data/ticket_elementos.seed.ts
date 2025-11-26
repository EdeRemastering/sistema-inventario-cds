import type { PrismaClient } from "@prisma/client";

export async function seedTicketElementos(prisma: PrismaClient) {
  console.log("🌱 Sembrando elementos de tickets...");
  
  // Obtener algunos tickets y elementos
  const tickets = await prisma.tickets_guardados.findMany({ take: 5 });
  const elementos = await prisma.elementos.findMany({ take: 10 });
  
  if (tickets.length === 0 || elementos.length === 0) {
    console.log("⚠️  No hay tickets o elementos disponibles para crear relaciones");
    return;
  }
  
  let count = 0;
  
  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];
    const elemento = elementos[i % elementos.length];
    
    // Verificar si ya existe la relación
    const existing = await prisma.ticket_elementos.findFirst({
      where: {
        ticket_id: ticket.id,
        elemento_id: elemento.id,
      },
    });
    
    if (existing) {
      continue;
    }
    
    // Crear relación ticket-elemento
    await prisma.ticket_elementos.create({
      data: {
        ticket_id: ticket.id,
        elemento_id: elemento.id,
        cantidad: 1,
        elemento_nombre: `${elemento.marca || ""} ${elemento.modelo || ""}`.trim() || elemento.serie,
        serie: elemento.serie,
        marca_modelo: `${elemento.marca || ""} ${elemento.modelo || ""}`.trim() || null,
      },
    });
    count++;
  }
  
  console.log(`✅ ${count} elementos de tickets sembrados correctamente`);
}

