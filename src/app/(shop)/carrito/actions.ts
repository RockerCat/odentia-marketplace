"use server";

import { revalidatePath } from "next/cache";
import {
  addToCart as addToCartLib,
  updateCartItem as updateCartItemLib,
  removeFromCart as removeFromCartLib,
} from "@/lib/cart";

export async function addToCartAction(formData: FormData) {
  const productId = formData.get("productId") as string;
  const quantity = Number(formData.get("quantity") ?? 1);
  const option = (formData.get("option") as string | null)?.trim() || null;

  await addToCartLib(productId, quantity, option);
  revalidatePath("/", "layout");
}

export async function updateCartItemAction(formData: FormData) {
  const key = formData.get("key") as string;
  const quantity = Number(formData.get("quantity") ?? 0);

  await updateCartItemLib(key, quantity);
  revalidatePath("/", "layout");
}

export async function removeFromCartAction(formData: FormData) {
  const key = formData.get("key") as string;

  await removeFromCartLib(key);
  revalidatePath("/", "layout");
}
