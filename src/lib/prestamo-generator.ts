import { prisma } from "./prisma";

/**
 * Genera un número de préstamo único siguiendo el formato: PRESTAMO-YYYY-NNNNNN
 */
export async function generateUniqueSavedPrestamoNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `PRESTAMO-${currentYear}`;

  try {
    const allPrestamos = await prisma.tickets_guardados.findMany({
      where: {
        OR: [
          { numero_ticket: { startsWith: prefix } },
          { numero_ticket: { startsWith: `TICKET-${currentYear}` } },
        ],
      },
      select: { numero_ticket: true },
    });

    let nextNumber = 1;
    for (const t of allPrestamos) {
      const parts = t.numero_ticket.split("-");
      if (parts.length >= 3) {
        const n = parseInt(parts[2], 10);
        if (!isNaN(n) && n >= nextNumber) nextNumber = n + 1;
      }
    }

    const formattedNumber = nextNumber.toString().padStart(6, "0");
    const prestamoNumber = `${prefix}-${formattedNumber}`;

    const existing = await prisma.tickets_guardados.findFirst({
      where: { numero_ticket: prestamoNumber },
    });

    if (existing) {
      return generateUniqueSavedPrestamoNumber();
    }

    return prestamoNumber;
  } catch (error) {
    console.error("Error generando número de préstamo:", error);
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }
}
