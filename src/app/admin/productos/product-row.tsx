"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import ConfirmSubmitButton from "@/components/confirm-submit-button";
import { deleteProductAction } from "./actions";

export default function ProductRow({
  product,
  imageUrl,
}: {
  product: {
    id: string;
    name: string;
    costPriceCents: number | null;
    priceCents: number;
    stock: number;
    category: { name: string };
  };
  imageUrl: string | null;
}) {
  const router = useRouter();
  const editHref = `/admin/productos/${product.id}/editar`;

  return (
    <tr
      onClick={() => router.push(editHref)}
      className="hover:bg-foreground/5 cursor-pointer"
    >
      <td className="px-5 py-3">
        <div className="w-10 h-10 rounded-lg bg-surface overflow-hidden flex items-center justify-center relative">
          {imageUrl ? (
            <Image src={imageUrl} alt="" fill className="object-cover" />
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </div>
      </td>
      <td className="px-5 py-3 font-medium text-foreground">{product.name}</td>
      <td className="px-5 py-3 text-muted-foreground">{product.category.name}</td>
      <td className="px-5 py-3 text-muted-foreground">
        {formatPrice(product.costPriceCents ?? product.priceCents)}
      </td>
      <td className="px-5 py-3">{formatPrice(product.priceCents)}</td>
      <td className="px-5 py-3">{product.stock}</td>
      <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <form action={deleteProductAction} className="inline">
          <input type="hidden" name="id" value={product.id} />
          <ConfirmSubmitButton
            confirmMessage="¿Eliminar este producto?"
            className="text-danger hover:underline"
          >
            Eliminar
          </ConfirmSubmitButton>
        </form>
      </td>
    </tr>
  );
}
