import { prisma } from "../../lib/prisma";
import type { TicketGuardado, CreateTicketInput } from "./types";

export function listTickets(): Promise<TicketGuardado[]> {
  return prisma.tickets_guardados.findMany({ 
    include: {
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
    orderBy: { id: "desc" } 
  });
}

export function createTicket(data: CreateTicketInput): Promise<TicketGuardado> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.tickets_guardados.create({ data: data as any }) as Promise<TicketGuardado>;
}

export function updateTicket(id: number, data: Partial<CreateTicketInput>): Promise<TicketGuardado> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return prisma.tickets_guardados.update({ where: { id }, data: data as any }) as Promise<TicketGuardado>;
}

export function deleteTicket(id: number): Promise<TicketGuardado> {
  return prisma.tickets_guardados.delete({ where: { id } }) as Promise<TicketGuardado>;
}


