import { S3Client } from "@aws-sdk/client-s3";

let r2Client: S3Client | null = null;

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
};

export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
    return null;
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicUrl };
}

export function getR2Client(): S3Client | null {
  const cfg = getR2Config();
  if (!cfg) return null;

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    });
  }

  return r2Client;
}

export function buildR2PublicUrl(key: string): string {
  const cfg = getR2Config();
  if (!cfg) {
    throw new Error(
      "R2 no está configurado (falta R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME / R2_PUBLIC_URL)"
    );
  }
  const normalizedKey = key.startsWith("/") ? key.slice(1) : key;
  return `${cfg.publicUrl}/${normalizedKey}`;
}

