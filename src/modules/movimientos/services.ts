import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import type { Movimiento, CreateMovimientoInput, UpdateMovimientoInput } from "./types";

/**
 * Mapea CreateMovimientoInput a Prisma.movimientosUncheckedCreateInput
 * Convierte los campos opcionales y maneja los valores null correctamente
 */
function mapCreateInputToPrisma(data: CreateMovimientoInput): Prisma.movimientosUncheckedCreateInput {
  return {
    elemento_id: data.elemento_id,
    cantidad: data.cantidad,
    orden_numero: data.orden_numero,
    fecha_movimiento: data.fecha_movimiento,
    dependencia_entrega: data.dependencia_entrega,
    firma_funcionario_entrega: data.firma_funcionario_entrega ?? null,
    cargo_funcionario_entrega: data.cargo_funcionario_entrega ?? null,
    dependencia_recibe: data.dependencia_recibe,
    firma_funcionario_recibe: data.firma_funcionario_recibe ?? null,
    cargo_funcionario_recibe: data.cargo_funcionario_recibe ?? null,
    motivo: data.motivo,
    fecha_estimada_devolucion: data.fecha_estimada_devolucion,
    fecha_real_devolucion: data.fecha_real_devolucion ?? null,
    observaciones_entrega: data.observaciones_entrega ?? null,
    observaciones_devolucion: data.observaciones_devolucion ?? null,
    firma_recepcion: data.firma_recepcion ?? null,
    tipo: data.tipo,
    ubicacion_anterior_id: data.ubicacion_anterior_id ?? null,
    ubicacion_nueva_id: data.ubicacion_nueva_id ?? null,
    usuario: data.usuario ?? null,
    firma_entrega: data.firma_entrega ?? null,
    firma_recibe: data.firma_recibe ?? null,
    codigo_equipo: data.codigo_equipo ?? null,
    serial_equipo: data.serial_equipo ?? null,
    hora_entrega: data.hora_entrega ?? null,
    hora_devolucion: data.hora_devolucion ?? null,
    numero_ticket: data.numero_ticket,
    firma_devuelve: data.firma_devuelve ?? null,
    firma_recibe_devolucion: data.firma_recibe_devolucion ?? null,
    devuelto_por: data.devuelto_por ?? null,
    recibido_por: data.recibido_por ?? null,
  };
}

/**
 * Mapea UpdateMovimientoInput a Prisma.movimientosUncheckedUpdateInput
 * Solo incluye los campos que están definidos (no undefined)
 */
function mapUpdateInputToPrisma(data: UpdateMovimientoInput): Prisma.movimientosUncheckedUpdateInput {
  const payload: Prisma.movimientosUncheckedUpdateInput = {};

  if (data.elemento_id !== undefined) payload.elemento_id = data.elemento_id;
  if (data.cantidad !== undefined) payload.cantidad = data.cantidad;
  if (data.orden_numero !== undefined) payload.orden_numero = data.orden_numero;
  if (data.fecha_movimiento !== undefined) payload.fecha_movimiento = data.fecha_movimiento;
  if (data.dependencia_entrega !== undefined) payload.dependencia_entrega = data.dependencia_entrega;
  if (data.firma_funcionario_entrega !== undefined) {
    payload.firma_funcionario_entrega = data.firma_funcionario_entrega ?? null;
  }
  if (data.cargo_funcionario_entrega !== undefined) {
    payload.cargo_funcionario_entrega = data.cargo_funcionario_entrega ?? null;
  }
  if (data.dependencia_recibe !== undefined) payload.dependencia_recibe = data.dependencia_recibe;
  if (data.firma_funcionario_recibe !== undefined) {
    payload.firma_funcionario_recibe = data.firma_funcionario_recibe ?? null;
  }
  if (data.cargo_funcionario_recibe !== undefined) {
    payload.cargo_funcionario_recibe = data.cargo_funcionario_recibe ?? null;
  }
  if (data.motivo !== undefined) payload.motivo = data.motivo;
  if (data.fecha_estimada_devolucion !== undefined) {
    payload.fecha_estimada_devolucion = data.fecha_estimada_devolucion;
  }
  if (data.fecha_real_devolucion !== undefined) {
    payload.fecha_real_devolucion = data.fecha_real_devolucion ?? null;
  }
  if (data.observaciones_entrega !== undefined) {
    payload.observaciones_entrega = data.observaciones_entrega ?? null;
  }
  if (data.observaciones_devolucion !== undefined) {
    payload.observaciones_devolucion = data.observaciones_devolucion ?? null;
  }
  if (data.firma_recepcion !== undefined) {
    payload.firma_recepcion = data.firma_recepcion ?? null;
  }
  if (data.tipo !== undefined) payload.tipo = data.tipo;
  if (data.ubicacion_anterior_id !== undefined) {
    payload.ubicacion_anterior_id = data.ubicacion_anterior_id ?? null;
  }
  if (data.ubicacion_nueva_id !== undefined) {
    payload.ubicacion_nueva_id = data.ubicacion_nueva_id ?? null;
  }
  if (data.usuario !== undefined) payload.usuario = data.usuario ?? null;
  if (data.firma_entrega !== undefined) payload.firma_entrega = data.firma_entrega ?? null;
  if (data.firma_recibe !== undefined) payload.firma_recibe = data.firma_recibe ?? null;
  if (data.codigo_equipo !== undefined) payload.codigo_equipo = data.codigo_equipo ?? null;
  if (data.serial_equipo !== undefined) payload.serial_equipo = data.serial_equipo ?? null;
  if (data.hora_entrega !== undefined) payload.hora_entrega = data.hora_entrega ?? null;
  if (data.hora_devolucion !== undefined) payload.hora_devolucion = data.hora_devolucion ?? null;
  if (data.numero_ticket !== undefined) payload.numero_ticket = data.numero_ticket;
  if (data.firma_devuelve !== undefined) payload.firma_devuelve = data.firma_devuelve ?? null;
  if (data.firma_recibe_devolucion !== undefined) {
    payload.firma_recibe_devolucion = data.firma_recibe_devolucion ?? null;
  }
  if (data.devuelto_por !== undefined) payload.devuelto_por = data.devuelto_por ?? null;
  if (data.recibido_por !== undefined) payload.recibido_por = data.recibido_por ?? null;

  return payload;
}

export function listMovimientos(): Promise<Movimiento[]> {
  return prisma.movimientos.findMany({
    include: {
      elemento: {
        include: {
          categoria: true,
          subcategoria: true,
        },
      },
      ubicacion_anterior: true,
      ubicacion_nueva: true,
    },
    orderBy: { id: "desc" }
  }) as Promise<Movimiento[]>;
}

export function createMovimiento(data: CreateMovimientoInput): Promise<Movimiento> {
  const payload = mapCreateInputToPrisma(data);
  return prisma.movimientos.create({
    data: payload,
    include: {
      elemento: {
        include: {
          categoria: true,
          subcategoria: true,
        },
      },
      ubicacion_anterior: true,
      ubicacion_nueva: true,
    },
  }) as Promise<Movimiento>;
}

export function updateMovimiento(id: number, data: UpdateMovimientoInput): Promise<Movimiento> {
  const payload = mapUpdateInputToPrisma(data);
  return prisma.movimientos.update({
    where: { id },
    data: payload,
    include: {
      elemento: {
        include: {
          categoria: true,
          subcategoria: true,
        },
      },
      ubicacion_anterior: true,
      ubicacion_nueva: true,
    },
  }) as Promise<Movimiento>;
}

export function deleteMovimiento(id: number): Promise<Movimiento> {
  return prisma.movimientos.delete({
    where: { id },
    include: {
      elemento: {
        include: {
          categoria: true,
          subcategoria: true,
        },
      },
      ubicacion_anterior: true,
      ubicacion_nueva: true,
    },
  }) as Promise<Movimiento>;
}

export async function findMovimientoByTicket(
  numero_ticket: string
): Promise<Movimiento | null> {
  const movimiento = await prisma.movimientos.findFirst({
    where: {
      numero_ticket,
      tipo: "SALIDA",
      fecha_real_devolucion: null, // Solo préstamos activos (no devueltos)
    },
    include: {
      elemento: {
        include: {
          categoria: true,
          subcategoria: true,
        },
      },
      ubicacion_anterior: true,
      ubicacion_nueva: true,
    },
  });
  return movimiento as Movimiento | null;
}


