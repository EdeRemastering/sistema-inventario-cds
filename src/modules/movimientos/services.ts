import { prisma } from "../../lib/prisma";
import type { Movimiento, CreateMovimientoInput, UpdateMovimientoInput } from "./types";

export function listMovimientos() {
  return prisma.movimientos.findMany({ orderBy: { id: "desc" } });
}

export function createMovimiento(data: CreateMovimientoInput): Promise<Movimiento> {
  return prisma.movimientos.create({ data });
}

export function updateMovimiento(id: number, data: UpdateMovimientoInput): Promise<Movimiento> {
  return prisma.movimientos.update({ where: { id }, data });
}

export function deleteMovimiento(id: number): Promise<Movimiento> {
  return prisma.movimientos.delete({ where: { id } });
}

export async function findMovimientoByTicket(numero_ticket: string) {
  return prisma.movimientos.findFirst({
    where: {
      numero_ticket,
      tipo: "SALIDA",
      fecha_real_devolucion: null, // Solo préstamos activos (no devueltos)
    },
    include: {
      elemento: {
        select: {
          id: true,
          serie: true,
          marca: true,
          modelo: true,
        },
      },
    },
  });
}


