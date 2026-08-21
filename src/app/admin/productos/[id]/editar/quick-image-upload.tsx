"use client";

import { useRef } from "react";
import { addProductImageAction } from "../../actions";

const FILE_INPUT_CLASS =
  "block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-teal-700 file:text-white file:font-medium file:cursor-pointer hover:file:bg-teal-800";

export default function QuickImageUpload({ productId }: { productId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={addProductImageAction}
      className="bg-white rounded-xl border border-slate-200 p-4"
    >
      <input type="hidden" name="productId" value={productId} />
      <label className="block text-sm font-medium text-slate-700 mb-1">Agregar imágenes</label>
      <input
        type="file"
        name="images"
        multiple
        accept="image/*"
        className={FILE_INPUT_CLASS}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            formRef.current?.requestSubmit();
          }
        }}
      />
      <p className="text-xs text-slate-400 mt-1">
        Se guardan automáticamente al elegirlas (JPG, PNG — máx. 4MB c/u).
      </p>
    </form>
  );
}
