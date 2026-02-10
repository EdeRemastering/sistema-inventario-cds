import type { PrismaClient } from "@prisma/client";

/** Solo 2 tickets de ejemplo para presentación. */
export const ticketsSeed = [
  {
    id: 1,
    numero_ticket: "TICKET-2024-000001",
    fecha_salida: new Date("2024-01-15T10:30:00"),
    fecha_estimada_devolucion: new Date("2024-02-15"),
    elemento: "Laptop Dell",
    serie: "LAP001",
    marca_modelo: "Dell Latitude 5520",
    cantidad: 1,
    dependencia_entrega: "Departamento de TI",
    firma_funcionario_entrega: null,
    dependencia_recibe: "Gerencia General",
    firma_funcionario_recibe: null,
    motivo: "Préstamo para trabajo remoto",
    orden_numero: "ORD-2024-001",
    usuario_guardado: "admin",
  },
  {
    id: 2,
    numero_ticket: "TICKET-2024-000002",
    fecha_salida: new Date("2024-01-20T14:15:00"),
    fecha_estimada_devolucion: new Date("2024-01-30"),
    elemento: "Monitor Samsung",
    serie: "MON002",
    marca_modelo: "Samsung 24\" LED",
    cantidad: 1,
    dependencia_entrega: "Almacén",
    firma_funcionario_entrega: null,
    dependencia_recibe: "Contabilidad",
    firma_funcionario_recibe: null,
    motivo: "Reemplazo temporal de monitor dañado",
    orden_numero: "ORD-2024-002",
    usuario_guardado: "admin",
  },
];

export async function seedTickets(prisma: PrismaClient) {
  console.log("🌱 Sembrando tickets...");
  for (const ticket of ticketsSeed) {
    await prisma.tickets_guardados.upsert({
      where: { id: ticket.id },
      update: ticket,
      create: ticket,
    });
  }
  console.log(`✅ ${ticketsSeed.length} tickets sembrados`);
}
