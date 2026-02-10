import { prisma } from "../../lib/prisma";
import type { PrestamoGuardado, CreatePrestamoInput } from "./types";

export function listPrestamos(): Promise<PrestamoGuardado[]> {
  return prisma.tickets_guardados.findMany({
    include: {
      ubicacion: {
        include: {
          sede: {
            select: {
              id: true,
              nombre: true,
              ciudad: true,
              municipio: true,
            },
          },
        },
      },
      ticket_elementos: {
        include: {
          elemento: {
            include: {
              categoria: true,
              subcategoria: true,
            },
          },
        },
      },
    },
    orderBy: { id: "desc" },
  });
}

export function createPrestamo(data: CreatePrestamoInput): Promise<PrestamoGuardado> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.tickets_guardados.create({ data: data as any }) as Promise<PrestamoGuardado>;
}

export function updatePrestamo(id: number, data: Partial<CreatePrestamoInput>): Promise<PrestamoGuardado> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.tickets_guardados.update({ where: { id }, data: data as any }) as Promise<PrestamoGuardado>;
}

export function deletePrestamo(id: number): Promise<PrestamoGuardado> {
  return prisma.tickets_guardados.delete({ where: { id } }) as Promise<PrestamoGuardado>;
}
