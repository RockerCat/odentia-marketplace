import "server-only";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Faltan las credenciales de Supabase en .env");
  }

  return createClient(url, key);
}

export async function uploadProductImage(file: File, productId: string) {
  const supabase = getClient();
  const ext = file.name.split(".").pop();
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

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
