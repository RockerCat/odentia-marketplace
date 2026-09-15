import "server-only";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";

// This bucket is public — an accepted file is served back to anyone with
// its URL, so the allowlist below (not the client's <input accept>, which
// is UX-only) is what actually decides what can land in it.
const ALLOWED_IMAGE_TYPES: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB — no prior server-side limit existed.

// First bytes of each allowed format's real file signature, checked against
// the file's actual content — MIME type and extension are both just labels
// supplied by the client and can't be trusted on their own.
const MAGIC_BYTES_CHECKS: Record<string, (bytes: Uint8Array) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  "image/png": (b) =>
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a,
  "image/webp": (b) =>
    b[0] === 0x52 && // "RIFF"
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 && // "WEBP"
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50,
};

export class InvalidImageError extends Error {}

function normalizedExtension(filename: string): string | null {
  const parts = filename.split(".");
  if (parts.length < 2) return null;
  const ext = parts.pop();
  return ext ? ext.toLowerCase() : null;
}

// Validates format (MIME + extension, cross-checked against each other) and
// size, then confirms the file's real content matches the claimed format via
// its magic bytes. Returns the normalized, allowlisted extension to use for
// the stored object name — never the caller-supplied extension as-is.
export async function assertValidProductImage(file: File): Promise<string> {
  if (!(file instanceof File) || file.size === 0) {
    throw new InvalidImageError("Selecciona una imagen válida.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new InvalidImageError("La imagen supera el tamaño máximo permitido de 5 MB.");
  }

  const allowedExtensions = ALLOWED_IMAGE_TYPES[file.type];
  if (!allowedExtensions) {
    throw new InvalidImageError("Formato de imagen no permitido. Usa JPG, PNG o WebP.");
  }

  const extension = normalizedExtension(file.name);
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new InvalidImageError("Formato de imagen no permitido. Usa JPG, PNG o WebP.");
  }

  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!MAGIC_BYTES_CHECKS[file.type](header)) {
    throw new InvalidImageError("El archivo no parece ser una imagen válida.");
  }

  return extension;
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Faltan las credenciales de Supabase en .env");
  }

  return createClient(url, key);
}

export async function uploadProductImage(file: File, productId: string) {
  const extension = await assertValidProductImage(file);

  const supabase = getClient();
  const path = `${productId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) throw error;

  return path;
}

export function getProductImageUrl(path: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${url}/storage/v1/object/public/${BUCKET}/${path}`;
}

export async function deleteProductImage(path: string) {
  const supabase = getClient();
  await supabase.storage.from(BUCKET).remove([path]);
}
