import { NextRequest, NextResponse } from "next/server";
import { 
  getTicketsWithElementos, 
  createTicket,
  deleteTicket
} from "../../../modules/tickets/services";
import { ticketCreateSchema } from "../../../modules/tickets/validations";
import { generateUniqueTicketNumber } from "../../../lib/ticket-generator";
import { saveSignature, isValidSignature } from "../../../lib/signature-storage";

export async function GET() {
  try {
    const tickets = await getTicketsWithElementos();
    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generar número de ticket automáticamente si no se proporciona
    const numero_ticket = body.numero_ticket || await generateUniqueTicketNumber();
    
    if (!numero_ticket) {
      return NextResponse.json(
        { error: "Error generando número de ticket" },
        { status: 500 }
      );
    }

    // Preparar los datos del ticket
    const ticketData = {
      ...body,
      numero_ticket,
    };

    // Validar los datos
    const parsed = ticketCreateSchema.safeParse(ticketData);
    if (!parsed.success) {
      console.error("Validation errors:", parsed.error);
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error },
        { status: 400 }
      );
    }

    // Crear el ticket
    const ticket = await createTicket({
      ...parsed.data,
      numero_ticket: numero_ticket,
      firma_funcionario_entrega: parsed.data.firma_funcionario_entrega || null,
      firma_funcionario_recibe: parsed.data.firma_funcionario_recibe || null,
      cargo_funcionario_entrega: parsed.data.cargo_funcionario_entrega || null,
      cargo_funcionario_recibe: parsed.data.cargo_funcionario_recibe || null,
      fecha_real_devolucion: parsed.data.fecha_real_devolucion || null,
      observaciones_entrega: parsed.data.observaciones_entrega || null,
      observaciones_devolucion: parsed.data.observaciones_devolucion || null,
      firma_recepcion: parsed.data.firma_recepcion || null,
      firma_entrega: parsed.data.firma_entrega || null,
      firma_recibe: parsed.data.firma_recibe || null,
      hora_entrega: parsed.data.hora_entrega || null,
      hora_devolucion: parsed.data.hora_devolucion || null,
      firma_devuelve: parsed.data.firma_devuelve || null,
      firma_recibe_devolucion: parsed.data.firma_recibe_devolucion || null,
      devuelto_por: parsed.data.devuelto_por || null,
      recibido_por: parsed.data.recibido_por || null,
    });
    
    // Manejar firmas si existen
    if (body.firmas?.entrega && isValidSignature(body.firmas.entrega)) {
      await saveSignature(body.firmas.entrega, "ticket", ticket.id, "entrega");
    }
    
    if (body.firmas?.recibe && isValidSignature(body.firmas.recibe)) {
      await saveSignature(body.firmas.recibe, "ticket", ticket.id, "recibe");
    }
    
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    await deleteTicket(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
