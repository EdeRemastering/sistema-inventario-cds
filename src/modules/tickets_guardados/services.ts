import { prisma } from "../../lib/prisma";
import type { TicketGuardado, CreateTicketInput } from "./types";

export function listTickets(): Promise<TicketGuardado[]> {
  return prisma.tickets_guardados.findMany({ orderBy: { id: "desc" } });
}

export function createTicket(data: CreateTicketInput): Promise<TicketGuardado> {
  return prisma.tickets_guardados.create({ data });
}

export function updateTicket(id: number, data: Partial<CreateTicketInput>): Promise<TicketGuardado> {
  return prisma.tickets_guardados.update({ where: { id }, data });
}

export function deleteTicket(id: number): Promise<TicketGuardado> {
  return prisma.tickets_guardados.delete({ where: { id } });
}


