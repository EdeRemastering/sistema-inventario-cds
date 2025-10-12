import { prisma } from "../../lib/prisma";
import { Ticket, CreateTicketInput, UpdateTicketInput, TicketWithElementos } from "./types";

export function listTickets(): Promise<Ticket[]> {
  return prisma.tickets.findMany({
    orderBy: {
      creado_en: "desc",
    },
  });
}

export function getTicketById(id: number): Promise<TicketWithElementos | null> {
  return prisma.tickets.findUnique({
    where: { id },
    include: {
      ticket_elementos: {
        include: {
          elemento: {
            include: {
              categoria: {
                select: {
                  nombre: true,
                },
              },
              subcategoria: {
                select: {
                  nombre: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export function createTicket(data: CreateTicketInput): Promise<Ticket> {
  return prisma.tickets.create({
    data: {
      numero_ticket: data.numero_ticket,
      orden_numero: data.orden_numero,
      fecha_movimiento: data.fecha_movimiento,
      dependencia_entrega: data.dependencia_entrega,
      firma_funcionario_entrega: data.firma_funcionario_entrega,
      cargo_funcionario_entrega: data.cargo_funcionario_entrega,
      dependencia_recibe: data.dependencia_recibe,
      firma_funcionario_recibe: data.firma_funcionario_recibe,
      cargo_funcionario_recibe: data.cargo_funcionario_recibe,
      motivo: data.motivo,
      fecha_estimada_devolucion: data.fecha_estimada_devolucion,
      fecha_real_devolucion: data.fecha_real_devolucion,
      observaciones_entrega: data.observaciones_entrega,
      observaciones_devolucion: data.observaciones_devolucion,
      firma_recepcion: data.firma_recepcion,
      tipo: data.tipo,
      firma_entrega: data.firma_entrega,
      firma_recibe: data.firma_recibe,
      hora_entrega: data.hora_entrega,
      hora_devolucion: data.hora_devolucion,
      firma_devuelve: data.firma_devuelve,
      firma_recibe_devolucion: data.firma_recibe_devolucion,
      devuelto_por: data.devuelto_por,
      recibido_por: data.recibido_por,
      ticket_elementos: {
        create: data.elementos.map((elemento) => ({
          elemento_id: elemento.elemento_id,
          cantidad: elemento.cantidad,
        })),
      },
    },
  });
}

export function updateTicket(id: number, data: UpdateTicketInput): Promise<Ticket> {
  return prisma.tickets.update({
    where: { id },
    data: {
      numero_ticket: data.numero_ticket,
      orden_numero: data.orden_numero,
      fecha_movimiento: data.fecha_movimiento,
      dependencia_entrega: data.dependencia_entrega,
      firma_funcionario_entrega: data.firma_funcionario_entrega,
      cargo_funcionario_entrega: data.cargo_funcionario_entrega,
      dependencia_recibe: data.dependencia_recibe,
      firma_funcionario_recibe: data.firma_funcionario_recibe,
      cargo_funcionario_recibe: data.cargo_funcionario_recibe,
      motivo: data.motivo,
      fecha_estimada_devolucion: data.fecha_estimada_devolucion,
      fecha_real_devolucion: data.fecha_real_devolucion,
      observaciones_entrega: data.observaciones_entrega,
      observaciones_devolucion: data.observaciones_devolucion,
      firma_recepcion: data.firma_recepcion,
      tipo: data.tipo,
      firma_entrega: data.firma_entrega,
      firma_recibe: data.firma_recibe,
      hora_entrega: data.hora_entrega,
      hora_devolucion: data.hora_devolucion,
      firma_devuelve: data.firma_devuelve,
      firma_recibe_devolucion: data.firma_recibe_devolucion,
      devuelto_por: data.devuelto_por,
      recibido_por: data.recibido_por,
    },
  });
}

export function deleteTicket(id: number): Promise<Ticket> {
  return prisma.tickets.delete({
    where: { id },
  });
}

export function getTicketsWithElementos(): Promise<TicketWithElementos[]> {
  return prisma.tickets.findMany({
    include: {
      ticket_elementos: {
        include: {
          elemento: {
            include: {
              categoria: {
                select: {
                  nombre: true,
                },
              },
              subcategoria: {
                select: {
                  nombre: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      creado_en: "desc",
    },
  });
}
