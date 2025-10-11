import { prisma } from "./prisma";

export type StockValidationResult = {
  isValid: boolean;
  availableQuantity: number;
  requestedQuantity: number;
  message?: string;
};

/**
 * Valida si hay suficiente stock disponible para un elemento
 */
export async function validateStock(
  elementoId: number,
  requestedQuantity: number
): Promise<StockValidationResult> {
  try {
    // Validar parámetros de entrada
    if (!elementoId || elementoId <= 0) {
      return {
        isValid: false,
        availableQuantity: 0,
        requestedQuantity,
        message: "ID de elemento inválido",
      };
    }

    if (!requestedQuantity || requestedQuantity <= 0) {
      return {
        isValid: false,
        availableQuantity: 0,
        requestedQuantity,
        message: "Cantidad solicitada inválida",
      };
    }

    const elemento = await prisma.elementos.findUnique({
      where: { id: elementoId },
      include: {
        movimientos: {
          where: {
            tipo: "SALIDA",
            fecha_real_devolucion: null, // Solo préstamos activos
          },
        },
      },
    });

    if (!elemento) {
      return {
        isValid: false,
        availableQuantity: 0,
        requestedQuantity,
        message: "Elemento no encontrado",
      };
    }

    // Validar que el elemento tenga cantidad válida
    if (elemento.cantidad === null || elemento.cantidad < 0) {
      return {
        isValid: false,
        availableQuantity: 0,
        requestedQuantity,
        message: "Cantidad del elemento no válida",
      };
    }

    // Calcular cantidad prestada (no devuelta)
    const totalPrestado = elemento.movimientos.reduce(
      (sum, movimiento) => sum + (movimiento.cantidad || 0),
      0
    );

    // Calcular cantidad disponible
    const availableQuantity = elemento.cantidad - totalPrestado;

    if (availableQuantity < requestedQuantity) {
      return {
        isValid: false,
        availableQuantity,
        requestedQuantity,
        message: `Stock insuficiente. Disponible: ${availableQuantity}, Solicitado: ${requestedQuantity}`,
      };
    }

    return {
      isValid: true,
      availableQuantity,
      requestedQuantity,
    };
  } catch (error) {
    console.error("Error validando stock:", error);
    
    // Proporcionar más detalles del error en desarrollo
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Error al validar stock: ${error instanceof Error ? error.message : 'Error desconocido'}`
      : "Error al validar stock";
    
    return {
      isValid: false,
      availableQuantity: 0,
      requestedQuantity,
      message: errorMessage,
    };
  }
}

/**
 * Actualiza el stock después de un préstamo
 */
export async function updateStockAfterLoan(): Promise<boolean> {
  try {
    // La lógica de stock se maneja a través de los movimientos
    // No necesitamos actualizar directamente la cantidad del elemento
    // ya que se calcula dinámicamente basado en los movimientos
    
    // Podríamos agregar aquí lógica adicional si fuera necesaria
    // como enviar notificaciones, crear alertas, etc.
    
    return true;
  } catch (error) {
    console.error("Error actualizando stock:", error);
    return false;
  }
}

/**
 * Obtiene el stock actual de un elemento (disponible para préstamo)
 */
export async function getCurrentStock(elementoId: number): Promise<number> {
  try {
    const elemento = await prisma.elementos.findUnique({
      where: { id: elementoId },
      include: {
        movimientos: {
          where: {
            tipo: "SALIDA",
            fecha_real_devolucion: null, // Solo préstamos activos
          },
        },
      },
    });

    if (!elemento) {
      return 0;
    }

    // Calcular cantidad prestada (no devuelta)
    const totalPrestado = elemento.movimientos.reduce(
      (sum, movimiento) => sum + movimiento.cantidad,
      0
    );

    // Calcular cantidad disponible
    return elemento.cantidad - totalPrestado;
  } catch (error) {
    console.error("Error obteniendo stock actual:", error);
    return 0;
  }
}

/**
 * Obtiene elementos con stock bajo (menos de 5 unidades disponibles)
 */
export async function getLowStockElements() {
  try {
    const elementos = await prisma.elementos.findMany({
      include: {
        categoria: true,
        subcategoria: true,
        movimientos: {
          where: {
            tipo: "SALIDA",
            fecha_real_devolucion: null,
          },
        },
      },
    });

    const lowStockElements = elementos.filter((elemento) => {
      const totalPrestado = elemento.movimientos.reduce(
        (sum, movimiento) => sum + movimiento.cantidad,
        0
      );
      const availableStock = elemento.cantidad - totalPrestado;
      return availableStock < 5;
    });

    return lowStockElements.map((elemento) => {
      const totalPrestado = elemento.movimientos.reduce(
        (sum, movimiento) => sum + movimiento.cantidad,
        0
      );
      const availableStock = elemento.cantidad - totalPrestado;
      
      return {
        ...elemento,
        availableStock,
        totalPrestado,
      };
    });
  } catch (error) {
    console.error("Error obteniendo elementos con stock bajo:", error);
    return [];
  }
}
