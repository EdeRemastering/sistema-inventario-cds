import { prisma } from "./prisma";

/**
 * Genera un número de ticket único siguiendo el formato: TICKET-YYYY-NNNNNN
 * donde YYYY es el año y NNNNNN es un número secuencial de 6 dígitos
 */
export async function generateUniqueTicketNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `TICKET-${currentYear}`;
  
  try {
    // Buscar el último ticket del año actual
    const lastTicket = await prisma.movimientos.findFirst({
      where: {
        numero_ticket: {
          startsWith: prefix,
        },
      },
      orderBy: {
        numero_ticket: 'desc',
      },
    });

    let nextNumber = 1;
    
    if (lastTicket) {
      // Extraer el número del último ticket
      const lastNumberStr = lastTicket.numero_ticket.split('-')[2];
      const lastNumber = parseInt(lastNumberStr, 10);
      nextNumber = lastNumber + 1;
    }

    // Formatear con 6 dígitos con ceros a la izquierda
    const formattedNumber = nextNumber.toString().padStart(6, '0');
    const ticketNumber = `${prefix}-${formattedNumber}`;

    // Verificar que no existe (doble verificación)
    const existingTicket = await prisma.movimientos.findUnique({
      where: {
        numero_ticket: ticketNumber,
      },
    });

    if (existingTicket) {
      // Si por alguna razón ya existe, generar el siguiente
      return generateUniqueTicketNumber();
    }

    return ticketNumber;
  } catch (error) {
    console.error('Error generando número de ticket:', error);
    // Fallback: usar timestamp como número único
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }
}

/**
 * Genera un número de ticket para tickets guardados
 */
export async function generateUniqueSavedTicketNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `TICKET-${currentYear}`;
  
  try {
    // Buscar el último ticket guardado del año actual
    const lastTicket = await prisma.tickets_guardados.findFirst({
      where: {
        numero_ticket: {
          startsWith: prefix,
        },
      },
      orderBy: {
        numero_ticket: 'desc',
      },
    });

    let nextNumber = 1;
    
    if (lastTicket?.numero_ticket) {
      // Extraer el número del último ticket de manera más robusta
      const parts = lastTicket.numero_ticket.split('-');
      
      if (parts.length >= 3) {
        const lastNumberStr = parts[2];
        const lastNumber = parseInt(lastNumberStr, 10);
        
        if (!isNaN(lastNumber) && lastNumber > 0) {
          nextNumber = lastNumber + 1;
        }
      }
    }

    // Formatear con 6 dígitos con ceros a la izquierda
    const formattedNumber = nextNumber.toString().padStart(6, '0');
    const ticketNumber = `${prefix}-${formattedNumber}`;

    // Verificar que no existe (doble verificación)
    const existingTicket = await prisma.tickets_guardados.findFirst({
      where: {
        numero_ticket: ticketNumber,
      },
    });

    if (existingTicket) {
      // Si por alguna razón ya existe, generar el siguiente
      return generateUniqueSavedTicketNumber();
    }

    return ticketNumber;
  } catch (error) {
    console.error('Error generando número de ticket guardado:', error);
    // Fallback: usar timestamp como número único
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }
}
