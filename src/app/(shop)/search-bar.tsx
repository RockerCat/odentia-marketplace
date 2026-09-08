"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const AUTO_SEARCH_MIN_LENGTH = 4;
const DEBOUNCE_MS = 400;

export default function SearchBar({
  initialQuery,
  category,
}: {
  initialQuery: string;
  category?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function navigate(q: string) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setValue(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = next.trim();
    if (trimmed.length > AUTO_SEARCH_MIN_LENGTH) {
      debounceRef.current = setTimeout(() => navigate(trimmed), DEBOUNCE_MS);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate(value.trim());
  }

  function handleClear() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setValue("");
    navigate("");
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Buscar productos…"
        className="flex-1 rounded-md border-slate-300 max-w-md"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-slate-400 hover:text-teal-700 self-center"
        >
          Limpiar
        </button>
      )}
    </form>
  );
}
