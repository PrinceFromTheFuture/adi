import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import path from "path";

// S3 client configuration - uses environment variables
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

// You can change this bucket name to match your S3 bucket
export const S3_BUCKET = "onboarding";

// Construct public URL from endpoint
const constructPublicUrl = () => {
  const endpoint = process.env.S3_ENDPOINT;
  if (!endpoint) return "";

  // Remove protocol if present
  const cleanEndpoint = endpoint.replace(/^https?:\/\//, "");

  // Return with https protocol
  return `https://${cleanEndpoint}`;
};

export const S3_PUBLIC_URL = constructPublicUrl();

interface UploadFileOptions {
  file: File | Buffer;
  filename?: string;
  contentType?: string;
}

interface UploadFileResult {
  success: boolean;
  url: string;
  filename: string;
}

/**
 * Upload a file to S3 storage
 */
export async function uploadFileToS3({ file, filename, contentType }: UploadFileOptions): Promise<UploadFileResult> {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);

  let buffer: Buffer;
  let finalFilename: string;
  let mimeType: string;

  if (file instanceof File) {
    buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name || "file";
    const fileExtension = path.extname(originalName);
    const baseFileName = path.basename(originalName, fileExtension);
    finalFilename = filename || `${baseFileName}_${timestamp}_${randomStr}${fileExtension}`;
    mimeType = contentType || file.type || "application/octet-stream";
  } else {
    buffer = file;
    finalFilename = filename || `file_${timestamp}_${randomStr}`;
    mimeType = contentType || "application/octet-stream";
  }

  const params = {
    Bucket: S3_BUCKET,
    Key: finalFilename,
    Body: buffer,
    ContentType: mimeType,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  // Construct the S3 URL
  const s3Url = `${S3_PUBLIC_URL}/${S3_BUCKET}/${finalFilename}`;

  return {
    success: true,
    url: s3Url,
    filename: finalFilename,
  };
}

export { s3Client };
