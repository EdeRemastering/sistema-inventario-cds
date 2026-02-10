import type { PrismaClient } from "@prisma/client";

function timeStringToDate(timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
}

/** Un solo movimiento de ejemplo (presentación). */
export const movimientosSeed = [
  {
    id: 1,
    elemento_id: 1,
    cantidad: 1,
    orden_numero: "19202509",
    fecha_movimiento: new Date("2025-09-19T14:35:28"),
    dependencia_entrega: "Centro de Sistemas Bodega",
    firma_funcionario_entrega: "/signatures/firma_funcionario_entrega_1758310528_1381.png",
    cargo_funcionario_entrega: "Almacenista",
    dependencia_recibe: "Ambiente 3",
    firma_funcionario_recibe: "/signatures/firma_funcionario_recibe_1758310528_8679.png",
    cargo_funcionario_recibe: "Docente",
    motivo: "Préstamo",
    fecha_estimada_devolucion: new Date("2025-09-19"),
    fecha_real_devolucion: new Date("2025-09-19T21:36:25"),
    observaciones_entrega: "En buen estado",
    observaciones_devolucion: "En buen estado",
    tipo: "DEVOLUCION" as const,
    codigo_equipo: "AA01-ME-01-01",
    serial_equipo: "N/A",
    hora_entrega: timeStringToDate("14:34:00"),
    hora_devolucion: timeStringToDate("21:36:00"),
    numero_ticket: "TICKET-20250919143528-2133",
    firma_entrega: "/signatures/firma_entrega_1758310528_1381.png",
    firma_recibe: "/signatures/firma_recibe_1758310528_8679.png",
    firma_devuelve: "/signatures/firma_devuelve_1758310585_3535.png",
    firma_recibe_devolucion: "/signatures/firma_recibe_devolucion_1758310585_7245.png",
    devuelto_por: "Ruben Zapata",
    recibido_por: "Abel Valderrama",
  },
];

export async function seedMovimientos(prisma: PrismaClient) {
  const firstElement = await prisma.elementos.findFirst({ select: { id: true } });
  const elementoId = firstElement?.id ?? 1;
  for (const m of movimientosSeed) {
    await prisma.movimientos.upsert({
      where: { id: m.id },
      update: {
        elemento_id: elementoId,
        cantidad: m.cantidad,
        orden_numero: m.orden_numero,
        fecha_movimiento: m.fecha_movimiento,
        dependencia_entrega: m.dependencia_entrega,
        firma_funcionario_entrega: m.firma_funcionario_entrega,
        cargo_funcionario_entrega: m.cargo_funcionario_entrega,
        dependencia_recibe: m.dependencia_recibe,
        firma_funcionario_recibe: m.firma_funcionario_recibe,
        cargo_funcionario_recibe: m.cargo_funcionario_recibe,
        motivo: m.motivo,
        fecha_estimada_devolucion: m.fecha_estimada_devolucion,
        fecha_real_devolucion: m.fecha_real_devolucion,
        observaciones_entrega: m.observaciones_entrega,
        observaciones_devolucion: m.observaciones_devolucion,
        firma_recepcion: null,
        tipo: m.tipo,
        firma_entrega: m.firma_entrega,
        firma_recibe: m.firma_recibe,
        codigo_equipo: m.codigo_equipo,
        serial_equipo: m.serial_equipo,
        hora_entrega: m.hora_entrega,
        hora_devolucion: m.hora_devolucion,
        numero_ticket: m.numero_ticket,
        firma_devuelve: m.firma_devuelve,
        firma_recibe_devolucion: m.firma_recibe_devolucion,
        devuelto_por: m.devuelto_por,
        recibido_por: m.recibido_por,
      },
      create: {
        id: m.id,
        elemento_id: elementoId,
        cantidad: m.cantidad,
        orden_numero: m.orden_numero,
        fecha_movimiento: m.fecha_movimiento,
        dependencia_entrega: m.dependencia_entrega,
        firma_funcionario_entrega: m.firma_funcionario_entrega,
        cargo_funcionario_entrega: m.cargo_funcionario_entrega,
        dependencia_recibe: m.dependencia_recibe,
        firma_funcionario_recibe: m.firma_funcionario_recibe,
        cargo_funcionario_recibe: m.cargo_funcionario_recibe,
        motivo: m.motivo,
        fecha_estimada_devolucion: m.fecha_estimada_devolucion,
        fecha_real_devolucion: m.fecha_real_devolucion,
        observaciones_entrega: m.observaciones_entrega,
        observaciones_devolucion: m.observaciones_devolucion,
        firma_recepcion: null,
        tipo: m.tipo,
        firma_entrega: m.firma_entrega,
        firma_recibe: m.firma_recibe,
        codigo_equipo: m.codigo_equipo,
        serial_equipo: m.serial_equipo,
        hora_entrega: m.hora_entrega,
        hora_devolucion: m.hora_devolucion,
        numero_ticket: m.numero_ticket,
        firma_devuelve: m.firma_devuelve,
        firma_recibe_devolucion: m.firma_recibe_devolucion,
        devuelto_por: m.devuelto_por,
        recibido_por: m.recibido_por,
      },
    });
  }
}
