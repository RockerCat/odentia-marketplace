"use client";

import { useRef } from "react";
import { addProductImageAction } from "../../actions";

const FILE_INPUT_CLASS =
  "block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:cursor-pointer hover:file:opacity-90";

export default function QuickImageUpload({ productId }: { productId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={addProductImageAction}
      className="bg-background rounded-xl border border-border p-4"
    >
      <input type="hidden" name="productId" value={productId} />
      <label htmlFor="images" className="block text-sm font-medium text-foreground/80 mb-1">
        Agregar imágenes
      </label>
      <input
        type="file"
        id="images"
        name="images"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className={FILE_INPUT_CLASS}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            formRef.current?.requestSubmit();
          }
        }}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Se guardan automáticamente al elegirlas (JPG, PNG o WebP — máx. 5MB c/u).
      </p>
    </form>
  );
}
