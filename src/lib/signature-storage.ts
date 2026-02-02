import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, getR2Config, buildR2PublicUrl } from "./r2-client";

/**
 * Guarda una firma en Cloudflare R2
 * @param signatureData - DataURL de la firma (base64)
 * @param prefix - Prefijo para el nombre del archivo
 * @param id - ID del registro
 * @param type - Tipo de firma
 * @returns URL pública de la firma en R2
 */
async function saveToR2(
  signatureData: string,
  prefix: string,
  id: number,
  type: string
): Promise<string> {
  const client = getR2Client();
  const cfg = getR2Config();
  if (!client || !cfg) throw new Error("R2 no está configurado para guardar firmas");

  // Extraer el contenido base64
  const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Generar nombre de archivo único
  const timestamp = Date.now();
  const filename = `signatures/${prefix}_${id}_${type}_${timestamp}.png`;
  
  // Subir a R2
  const command = new PutObjectCommand({
    Bucket: cfg.bucketName,
    Key: filename,
    Body: buffer,
    ContentType: 'image/png',
  });
  
  await client.send(command);
  
  return buildR2PublicUrl(filename);
}

/**
 * Guarda una firma digital
 * Obligatorio: Cloudflare R2
 * @param signatureData - DataURL de la firma (base64)
 * @param prefix - Prefijo para el nombre del archivo (ej: "movimiento", "ticket")
 * @param id - ID del registro
 * @param type - Tipo de firma (ej: "entrega", "recibe")
 * @returns URL pública de R2
 */
export async function saveSignature(
  signatureData: string,
  prefix: string,
  id: number,
  type: string
): Promise<string> {
  try {
    return await saveToR2(signatureData, prefix, id, type);
  } catch (error) {
    console.error("Error guardando firma en R2:", error);
    throw new Error("Error al guardar la firma (R2)");
  }
}

/**
 * Elimina una firma de R2
 * @param signatureUrl - URL de la firma en R2
 */
async function deleteFromR2(signatureUrl: string): Promise<void> {
  const client = getR2Client();
  const cfg = getR2Config();
  if (!client || !cfg) throw new Error("R2 no está configurado");

  // Extraer la key del archivo de la URL
  const url = new URL(signatureUrl);
  const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
  
  const command = new DeleteObjectCommand({
    Bucket: cfg.bucketName,
    Key: key,
  });
  
  await client.send(command);
  console.log('Firma eliminada de R2:', key);
}

/**
 * Elimina una firma del servidor (R2 o filesystem)
 * @param signatureUrl - URL de la firma a eliminar
 */
export async function deleteSignature(signatureUrl: string): Promise<void> {
  try {
    if (!signatureUrl) return;

    // Si no está configurado R2, no bloqueamos el flujo.
    const cfg = getR2Config();
    if (!cfg) return;

    // Solo borramos si apunta a nuestro public URL (evita borrar URLs externas)
    if (!signatureUrl.startsWith(cfg.publicUrl)) return;

    await deleteFromR2(signatureUrl);
  } catch (error) {
    console.error("Error eliminando firma (no crítico):", error);
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
    console.log("Firma inválida: no es un data URL válido");
    return false;
  }
  
  // Verificar que no sea solo el canvas vacío (generalmente es muy pequeño)
  const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
  const isValid = base64Data.length > 100; // Reducido de 1000 a 100 para ser más flexible
  
  if (!isValid) {
    console.log(`Firma inválida: tamaño muy pequeño (${base64Data.length} caracteres)`);
  } else {
    console.log(`Firma válida: ${base64Data.length} caracteres`);
  }
  
  return isValid;
}

