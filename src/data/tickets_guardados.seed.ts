import type { PrismaClient } from "@prisma/client";

export const ticketsSeed = [
  {
    numero_ticket: "TICKET-2024-000001",
    fecha_salida: new Date("2024-01-15T10:30:00"),
    fecha_estimada_devolucion: new Date("2024-02-15"),
    elemento: "Laptop Dell",
    serie: "LAP001",
    marca_modelo: "Dell Latitude 5520",
    cantidad: 1,
    dependencia_entrega: "Departamento de TI",
    firma_funcionario_entrega: null, // Se llenará con firma real si es necesario
    dependencia_recibe: "Gerencia General",
    firma_funcionario_recibe: null, // Se llenará con firma real si es necesario
    motivo: "Préstamo para trabajo remoto del gerente",
    orden_numero: "ORD-2024-001",
    usuario_guardado: "admin",
  },
  {
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
  {
    numero_ticket: "TICKET-2024-000003",
    fecha_salida: new Date("2024-02-01T09:00:00"),
    fecha_estimada_devolucion: new Date("2024-02-28"),
    elemento: "Impresora HP",
    serie: "IMP003",
    marca_modelo: "HP LaserJet Pro",
    cantidad: 1,
    dependencia_entrega: "Departamento de TI",
    firma_funcionario_entrega: null,
    dependencia_recibe: "Recursos Humanos",
    firma_funcionario_recibe: null,
    motivo: "Préstamo temporal para proyecto de contrataciones",
    orden_numero: "ORD-2024-003",
    usuario_guardado: "admin",
  },
  {
    numero_ticket: "TICKET-2024-000004",
    fecha_salida: new Date("2024-02-10T16:45:00"),
    fecha_estimada_devolucion: new Date("2024-03-10"),
    elemento: "Tablet iPad",
    serie: "TAB004",
    marca_modelo: "iPad Air 5ta Gen",
    cantidad: 1,
    dependencia_entrega: "Almacén",
    firma_funcionario_entrega: null,
    dependencia_recibe: "Marketing",
    firma_funcionario_recibe: null,
    motivo: "Presentaciones móviles para eventos corporativos",
    orden_numero: "ORD-2024-004",
    usuario_guardado: "admin",
  },
  {
    numero_ticket: "TICKET-2024-000005",
    fecha_salida: new Date("2024-02-15T11:20:00"),
    fecha_estimada_devolucion: new Date("2024-02-20"),
    elemento: "Proyector Epson",
    serie: "PRO005",
    marca_modelo: "Epson PowerLite 1781W",
    cantidad: 1,
    dependencia_entrega: "Departamento de TI",
    firma_funcionario_entrega: null,
    dependencia_recibe: "Sala de Juntas",
    firma_funcionario_recibe: null,
    motivo: "Presentación ejecutiva semanal",
    orden_numero: "ORD-2024-005",
    usuario_guardado: "admin",
  },
];

export async function seedTickets(prisma: PrismaClient) {
  console.log("🌱 Seeding tickets...");

  for (const ticket of ticketsSeed) {
    await prisma.tickets_guardados.upsert({
      where: { numero_ticket: ticket.numero_ticket },
      update: ticket,
      create: ticket,
    });
  }

  console.log(`✅ Seeded ${ticketsSeed.length} tickets`);
}


