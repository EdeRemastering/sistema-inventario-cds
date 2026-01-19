import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuración del cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "sistema-inventario-cds";
const FOLDER_PREFIX = "elementos/";

export type UploadResult = {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
};

/**
 * Sube una imagen a S3
 */
export async function uploadImageToS3(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string
): Promise<UploadResult> {
  try {
    // Generar nombre único para evitar colisiones
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${FOLDER_PREFIX}${timestamp}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: "public-read", // Hacer la imagen pública
    });

    await s3Client.send(command);

    // Construir URL pública
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al subir imagen",
    };
  }
}

/**
 * Elimina una imagen de S3
 */
export async function deleteImageFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return false;
  }
}

/**
 * Genera una URL prefirmada para subir directamente desde el cliente
 */
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn = 3600 // 1 hora por defecto
): Promise<{ url: string; key: string } | null> {
  try {
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${FOLDER_PREFIX}${timestamp}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const url = await getSignedUrl(s3Client as any, command as any, { expiresIn });

    return { url, key };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return null;
  }
}

/**
 * Genera una URL prefirmada para descargar (útil si las imágenes son privadas)
 */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await getSignedUrl(s3Client as any, command as any, { expiresIn });
  } catch (error) {
    console.error("Error generating presigned download URL:", error);
    return null;
  }
}

/**
 * Extrae la key de S3 desde una URL completa
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Formato: https://bucket.s3.region.amazonaws.com/key
    return urlObj.pathname.slice(1); // Remover el "/" inicial
  } catch {
    return null;
  }
}

/**
 * Valida que un archivo sea una imagen válida
 */
export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP, GIF",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "El archivo es muy grande. Máximo 5MB",
    };
  }

  return { valid: true };
}
