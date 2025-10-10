import { prisma } from "./prisma";

/**
 * Función de utilidad para manejar conexiones de base de datos con reintentos
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Intento ${attempt} falló:`, error);
      
      // Si es un error de conexión y no es el último intento, esperar y reintentar
      if (attempt < maxRetries && isConnectionError(error)) {
        console.log(`Esperando ${delayMs}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Aumentar el delay exponencialmente
      } else {
        break;
      }
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  throw new Error(
    `No se pudo conectar a la base de datos después de ${maxRetries} intentos. ` +
    `Último error: ${lastError?.message || 'Error desconocido'}. ` +
    `Verifica tu conexión a internet y la configuración del servidor.`
  );
}

/**
 * Verifica si un error es relacionado con la conexión
 */
function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  const errorMessage = error.message.toLowerCase();
  const connectionErrors = [
    'can\'t reach database server',
    'connection refused',
    'timeout',
    'network error',
    'econnrefused',
    'enotfound',
    'etimedout'
  ];
  
  return connectionErrors.some(connectionError => 
    errorMessage.includes(connectionError)
  );
}

/**
 * Función para verificar la salud de la conexión a la base de datos
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Health check de base de datos falló:", error);
    return false;
  }
}

/**
 * Función para cerrar la conexión de Prisma de manera segura
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log("Conexión a la base de datos cerrada correctamente");
  } catch (error) {
    console.error("Error al cerrar la conexión de base de datos:", error);
  }
}
