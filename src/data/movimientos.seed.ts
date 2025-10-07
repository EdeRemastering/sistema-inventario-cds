import type { PrismaClient } from "../generated/prisma";

// Función helper para convertir string de tiempo a Date
function timeStringToDate(timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds, 0);
  return date;
}

export const movimientosSeed = [
  { id: 1, elemento_id: 1, cantidad: 1, orden_numero: "19202509", fecha_movimiento: new Date("2025-09-19T14:35:28"), dependencia_entrega: "Centro de Sistemas Bodega", funcionario_entrega: "Abel ", cargo_funcionario_entrega: "Amacenista", dependencia_recibe: "Ambiente 3", funcionario_recibe: "Ruben Zapata", cargo_funcionario_recibe: "Docente", motivo: "Prestamo", fecha_estimada_devolucion: new Date("2025-09-19"), fecha_real_devolucion: new Date("2025-09-19T21:36:25"), observaciones_entrega: "en buen  estado", observaciones_devolucion: "en buen estado", tipo: "DEVOLUCION" as const, codigo_equipo: "AA01-ME-01-01", serial_equipo: "N/A", hora_entrega: timeStringToDate("14:34:00"), hora_devolucion: timeStringToDate("21:36:00"), numero_ticket: "TICKET-20250919143528-2133", firma_entrega: "firmas/firma_entrega_1758310528_1381.png", firma_recibe: "firmas/firma_recibe_1758310528_8679.png", firma_devuelve: "firmas/firma_devuelve_1758310585_3535.png", firma_recibe_devolucion: "firmas/firma_recibe_devolucion_1758310585_7245.png", devuelto_por: "Ruben Zapata", recibido_por: "Abel valderrama" },
  { id: 2, elemento_id: 1, cantidad: 1, orden_numero: "19202509", fecha_movimiento: new Date("2025-09-19T15:10:45"), dependencia_entrega: "Centro de Sistemas", funcionario_entrega: "Abel ", cargo_funcionario_entrega: "Amacenista", dependencia_recibe: "Ambiente 3", funcionario_recibe: "Ruben Zapata", cargo_funcionario_recibe: "Docente", motivo: "Prestamo", fecha_estimada_devolucion: new Date("2025-09-19"), fecha_real_devolucion: new Date("2025-09-19T22:11:23"), observaciones_entrega: "en buen  estado", observaciones_devolucion: "en buen estado", tipo: "DEVOLUCION" as const, codigo_equipo: "AA01-ME-01-01", serial_equipo: "N/A", hora_entrega: timeStringToDate("15:10:00"), hora_devolucion: timeStringToDate("22:11:00"), numero_ticket: "TICKET-20250919151045-6066", firma_entrega: "firmas/firma_entrega_1758312645_3431.png", firma_recibe: "firmas/firma_recibe_1758312645_5148.png", firma_devuelve: "firmas/firma_devuelve_1758312683_8717.png", firma_recibe_devolucion: "firmas/firma_recibe_devolucion_1758312683_7170.png", devuelto_por: "Ruben Zapata", recibido_por: "Abel Valderrama" },
  { id: 3, elemento_id: 1, cantidad: 1, orden_numero: "19202509", fecha_movimiento: new Date("2025-09-19T15:15:24"), dependencia_entrega: "Centro de Sistemas", funcionario_entrega: "Abel ", cargo_funcionario_entrega: "Amacenista", dependencia_recibe: "Ambiente 3", funcionario_recibe: "Ruben Zapata", cargo_funcionario_recibe: "Docente", motivo: "Prestamo", fecha_estimada_devolucion: new Date("2025-09-19"), fecha_real_devolucion: new Date("2025-09-19T22:16:26"), observaciones_entrega: "en buen  estado", observaciones_devolucion: "en buen estado", tipo: "DEVOLUCION" as const, codigo_equipo: "AA01-ME-01-01", serial_equipo: "N/A", hora_entrega: timeStringToDate("15:14:00"), hora_devolucion: timeStringToDate("22:16:00"), numero_ticket: "TICKET-20250919151524-5155", firma_entrega: "firmas/firma_entrega_1758312924_9943.png", firma_recibe: "firmas/firma_recibe_1758312924_4997.png", firma_devuelve: "firmas/firma_devuelve_1758312986_4604.png", firma_recibe_devolucion: "firmas/firma_recibe_devolucion_1758312986_7296.png", devuelto_por: "Ruben Zapata", recibido_por: "Abel valderrama" },
  { id: 4, elemento_id: 2, cantidad: 1, orden_numero: "19202509", fecha_movimiento: new Date("2025-09-19T15:21:22"), dependencia_entrega: "Centro de Sistemas", funcionario_entrega: "Abel ", cargo_funcionario_entrega: "Amacenista", dependencia_recibe: "Ambiente 3", funcionario_recibe: "Ruben Zapata", cargo_funcionario_recibe: "Docente", motivo: "Prestamo", fecha_estimada_devolucion: new Date("2025-09-19"), fecha_real_devolucion: new Date("2025-09-19T22:21:57"), observaciones_entrega: "en buen  estado", observaciones_devolucion: "en buen estado", tipo: "DEVOLUCION" as const, codigo_equipo: "AA01-ME-01-01", serial_equipo: "001254", hora_entrega: timeStringToDate("15:20:00"), hora_devolucion: timeStringToDate("22:21:00"), numero_ticket: "TICKET-20250919152122-1942", firma_entrega: "firmas/firma_entrega_1758313282_7763.png", firma_recibe: "firmas/firma_recibe_1758313282_3337.png", firma_devuelve: "firmas/firma_devuelve_1758313317_3403.png", firma_recibe_devolucion: "firmas/firma_recibe_devolucion_1758313317_4801.png", devuelto_por: "Ruben Zapata", recibido_por: "Abel valderrama" },
];

export async function seedMovimientos(prisma: PrismaClient) {
  for (const m of movimientosSeed) {
    await prisma.movimientos.upsert({
      where: { id: m.id },
      update: {
        elemento_id: m.elemento_id,
        cantidad: m.cantidad,
        orden_numero: m.orden_numero,
        fecha_movimiento: m.fecha_movimiento,
        dependencia_entrega: m.dependencia_entrega,
        funcionario_entrega: m.funcionario_entrega,
        cargo_funcionario_entrega: m.cargo_funcionario_entrega,
        dependencia_recibe: m.dependencia_recibe,
        funcionario_recibe: m.funcionario_recibe,
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
        elemento_id: m.elemento_id,
        cantidad: m.cantidad,
        orden_numero: m.orden_numero,
        fecha_movimiento: m.fecha_movimiento,
        dependencia_entrega: m.dependencia_entrega,
        funcionario_entrega: m.funcionario_entrega,
        cargo_funcionario_entrega: m.cargo_funcionario_entrega,
        dependencia_recibe: m.dependencia_recibe,
        funcionario_recibe: m.funcionario_recibe,
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


