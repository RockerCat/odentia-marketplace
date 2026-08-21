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

  await addToCartLib(productId, quantity);
  revalidatePath("/", "layout");
}

export async function updateCartItemAction(formData: FormData) {
  const productId = formData.get("productId") as string;
  const quantity = Number(formData.get("quantity") ?? 0);

  await updateCartItemLib(productId, quantity);
  revalidatePath("/", "layout");
}

export async function removeFromCartAction(formData: FormData) {
  const productId = formData.get("productId") as string;

  await removeFromCartLib(productId);
  revalidatePath("/", "layout");
}
