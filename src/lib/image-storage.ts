import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { buildR2PublicUrl, getR2Client, getR2Config } from "./r2-client";

function inferExtension(contentType: string | undefined): string {
  if (!contentType) return "bin";
  if (contentType === "image/png") return "png";
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  return "bin";
}

export type SaveImageOptions = {
  folder?: string; // default: images
  prefix?: string; // optional prefix for filename
  contentType?: string;
};

/**
 * Sube una imagen a Cloudflare R2 y devuelve la URL pública.
 * - Requiere `R2_*` configurado y `R2_PUBLIC_URL` con acceso público habilitado.
 */
export async function saveImageToR2(
  input: File | Blob | Buffer,
  opts: SaveImageOptions = {}
): Promise<string> {
  const client = getR2Client();
  const cfg = getR2Config();
  if (!client || !cfg) {
    throw new Error("R2 no está configurado para subir imágenes");
  }

  const folder = (opts.folder ?? "images").replace(/^\/+|\/+$/g, "");
  const prefix = opts.prefix ? `${opts.prefix}_` : "";

  let body: Buffer;
  let contentType = opts.contentType;

  // File/Blob (server actions)
  if (typeof (input as File).arrayBuffer === "function") {
    const ab = await (input as File).arrayBuffer();
    body = Buffer.from(ab);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contentType = contentType ?? (input as any).type ?? undefined;
  } else {
    body = input as Buffer;
  }

  const ext = inferExtension(contentType);
  const key = `${folder}/${prefix}${randomUUID()}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType ?? "application/octet-stream",
    })
  );

  return buildR2PublicUrl(key);
}

/**
 * Sube un PDF a R2 (para evidencias de baja, comprobantes, etc.)
 */
export async function savePdfToR2(
  input: File | Blob | Buffer,
  opts: { folder?: string; prefix?: string } = {}
): Promise<string> {
  const client = getR2Client();
  const cfg = getR2Config();
  if (!client || !cfg) {
    throw new Error("R2 no está configurado");
  }
  const folder = (opts.folder ?? "pdfs").replace(/^\/+|\/+$/g, "");
  const prefix = opts.prefix ? `${opts.prefix}_` : "";

  let body: Buffer;
  if (typeof (input as File).arrayBuffer === "function") {
    const ab = await (input as File).arrayBuffer();
    body = Buffer.from(ab);
  } else {
    body = input as Buffer;
  }
  const key = `${folder}/${prefix}${randomUUID()}.pdf`;
  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucketName,
      Key: key,
      Body: body,
      ContentType: "application/pdf",
    })
  );
  return buildR2PublicUrl(key);
}

export async function deleteImageFromR2(imageUrl: string): Promise<void> {
  const client = getR2Client();
  const cfg = getR2Config();
  if (!client || !cfg) return;

  // Solo borrar si apunta a nuestro public URL
  const publicUrl = cfg.publicUrl;
  if (!imageUrl.startsWith(publicUrl)) return;

  const key = imageUrl.slice(publicUrl.length).replace(/^\/+/, "");
  if (!key) return;

  await client.send(
    new DeleteObjectCommand({
      Bucket: cfg.bucketName,
      Key: key,
    })
  );
}

