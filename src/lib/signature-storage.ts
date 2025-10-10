import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Guarda una firma digital como imagen en el servidor
 * @param signatureData - DataURL de la firma (base64)
 * @param prefix - Prefijo para el nombre del archivo (ej: "movimiento", "ticket")
 * @param id - ID del registro
 * @param type - Tipo de firma (ej: "entrega", "recibe")
 * @returns URL relativa de la imagen guardada
 */
export async function saveSignature(
  signatureData: string,
  prefix: string,
  id: number,
  type: string
): Promise<string> {
  try {
    // Extraer el base64 de la dataURL
    const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
    
    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const filename = `${prefix}_${id}_${type}_${timestamp}.png`;
    const filepath = join(process.cwd(), 'public', 'signatures', filename);
    
    // Guardar el archivo
    await writeFile(filepath, base64Data, 'base64');
    
    // Retornar la URL relativa
    return `/signatures/${filename}`;
  } catch (error) {
    console.error('Error guardando firma:', error);
    throw new Error('Error al guardar la firma');
  }
}

/**
 * Elimina una firma del servidor
 * @param signatureUrl - URL de la firma a eliminar
 */
export async function deleteSignature(signatureUrl: string): Promise<void> {
  try {
    if (!signatureUrl || !signatureUrl.startsWith('/signatures/')) {
      return;
    }
    
    const { unlink } = await import('fs/promises');
    const filepath = join(process.cwd(), 'public', signatureUrl);
    await unlink(filepath);
  } catch (error) {
    console.error('Error eliminando firma:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
}

/**
 * Valida si una firma es válida (no está vacía)
 * @param signatureData - DataURL de la firma
 * @returns true si la firma es válida
 */
export function isValidSignature(signatureData: string): boolean {
  if (!signatureData || !signatureData.startsWith('data:image/png;base64,')) {
    return false;
  }
  
  // Verificar que no sea solo el canvas vacío (generalmente es muy pequeño)
  const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
  return base64Data.length > 1000; // Un canvas vacío suele ser menor a 1000 caracteres
}
