"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="lg:w-96 shrink-0">
      <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center relative">
        {images.length > 0 ? (
          <Image src={images[active]} alt={alt} fill className="object-cover" />
        ) : (
          <span className="text-slate-300 text-sm">Sin imagen</span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={`w-16 h-16 rounded-md overflow-hidden border relative ${
                i === active ? "border-teal-600" : "border-slate-200"
              }`}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
