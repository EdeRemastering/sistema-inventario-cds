import { writeFile } from 'fs/promises';
import { join } from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Configuración del cliente R2 de Cloudflare
let r2Client: S3Client | null = null;

function getR2Client(): S3Client | null {
  // Solo crear el cliente si tenemos las credenciales configuradas
  if (!process.env.R2_ACCOUNT_ID || 
      !process.env.R2_ACCESS_KEY_ID || 
      !process.env.R2_SECRET_ACCESS_KEY) {
    return null;
  }

  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  
  return r2Client;
}

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
  
  if (!client || !process.env.R2_BUCKET_NAME) {
    throw new Error('Configuración de R2 incompleta');
  }

  // Extraer el contenido base64
  const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  // Generar nombre de archivo único
  const timestamp = Date.now();
  const filename = `signatures/${prefix}_${id}_${type}_${timestamp}.png`;
  
  // Subir a R2
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: 'image/png',
  });
  
  await client.send(command);
  
  // Construir URL pública
  // IMPORTANTE: R2 requiere un dominio público configurado (R2.dev o custom domain)
  // La URL por defecto de R2 NO es accesible públicamente
  if (!process.env.R2_PUBLIC_URL) {
    console.error('⚠️ ERROR: R2_PUBLIC_URL no está configurado en .env');
    console.error('⚠️ Las imágenes NO serán accesibles sin un dominio público');
    console.error('⚠️ Configura un dominio R2.dev en: Dashboard > R2 > Tu Bucket > Settings > Public Access');
    throw new Error('R2_PUBLIC_URL no está configurado. Las imágenes no serán accesibles. Ver docs/setup/CONFIGURAR_ACCESO_PUBLICO_R2.md');
  }
  
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
  
  console.log('✅ Firma guardada en R2:', publicUrl);
  return publicUrl;
}

/**
 * Guarda una firma digital
 * Prioridad: R2 > FileSystem > Data URL
 * @param signatureData - DataURL de la firma (base64)
 * @param prefix - Prefijo para el nombre del archivo (ej: "movimiento", "ticket")
 * @param id - ID del registro
 * @param type - Tipo de firma (ej: "entrega", "recibe")
 * @returns URL relativa, URL de R2 o data URL de la firma
 */
export async function saveSignature(
  signatureData: string,
  prefix: string,
  id: number,
  type: string
): Promise<string> {
  try {
    const useR2 = process.env.USE_R2_STORAGE === 'true';
    const useFileSystem = process.env.USE_FILESYSTEM_SIGNATURES === 'true';
    
    // Intentar guardar en R2 si está configurado
    if (useR2) {
      try {
        const r2Url = await saveToR2(signatureData, prefix, id, type);
        return r2Url;
      } catch (r2Error) {
        console.error('Error guardando en R2, intentando método alternativo:', r2Error);
      }
    }
    
    // Si no se usa R2 o falló, intentar filesystem
    if (useFileSystem) {
      try {
        const base64Data = signatureData.replace(/^data:image\/png;base64,/, '');
        const timestamp = Date.now();
        const filename = `${prefix}_${id}_${type}_${timestamp}.png`;
        const filepath = join(process.cwd(), 'public', 'signatures', filename);
        
        await writeFile(filepath, base64Data, 'base64');
        console.log('Firma guardada como archivo local:', filename);
        
        return `/signatures/${filename}`;
      } catch (fsError) {
        console.warn('No se pudo guardar como archivo, usando data URL:', fsError);
      }
    }
    
    // Fallback: guardar como data URL en la BD
    console.log('Guardando firma como data URL en BD');
    return signatureData;
  } catch (error) {
    console.error('Error guardando firma:', error);
    throw new Error('Error al guardar la firma');
  }
}

/**
 * Elimina una firma de R2
 * @param signatureUrl - URL de la firma en R2
 */
async function deleteFromR2(signatureUrl: string): Promise<void> {
  const client = getR2Client();
  
  if (!client || !process.env.R2_BUCKET_NAME) {
    throw new Error('Configuración de R2 incompleta');
  }

  // Extraer la key del archivo de la URL
  const url = new URL(signatureUrl);
  const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
  
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
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
    // Si es un data URL (base64), no hay archivo que eliminar
    if (!signatureUrl || signatureUrl.startsWith('data:image/')) {
      return;
    }
    
    // Detectar si es una URL de R2
    const isR2Url = signatureUrl.includes('r2.cloudflarestorage.com') || 
                    (process.env.R2_PUBLIC_URL && signatureUrl.startsWith(process.env.R2_PUBLIC_URL));
    
    if (isR2Url) {
      try {
        await deleteFromR2(signatureUrl);
        return;
      } catch (r2Error) {
        console.error('Error eliminando de R2 (no crítico):', r2Error);
      }
    }
    
    // Intentar eliminar si es una URL de archivo local
    if (signatureUrl.startsWith('/signatures/')) {
      const { unlink } = await import('fs/promises');
      const filepath = join(process.cwd(), 'public', signatureUrl);
      await unlink(filepath);
      console.log('Archivo de firma eliminado:', signatureUrl);
    }
  } catch (error) {
    console.error('Error eliminando firma (no crítico):', error);
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

