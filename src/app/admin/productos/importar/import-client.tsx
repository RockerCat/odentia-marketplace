"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/generated/prisma/client";
import { createProductsFromImportAction } from "../actions";

type Row = {
  id: string;
  name: string;
  price: string;
  stock: string;
  categoryId: string;
  options: string;
  include: boolean;
};

const FILE_INPUT_CLASS =
  "block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-teal-700 file:text-white file:font-medium file:cursor-pointer hover:file:bg-teal-800";

export default function ImportPdfClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<"idle" | "parsing" | "creating">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const defaultCategoryId = categories[0]?.id ?? "";

  async function handleFile(file: File) {
    setError(null);
    setStatus("parsing");
    setFileName(file.name);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("/api/admin/import-pdf", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo leer el PDF.");
        setRows([]);
        return;
      }

      const parsedRows: Row[] = data.rows.map(
        (
          r: {
            name: string;
            price: number;
            stock: number | null;
            suggestedCategoryId: string | null;
            options: string[];
          },
          i: number
        ) => ({
          id: `parsed-${i}`,
          name: r.name,
          price: String(Math.round(r.price)),
          stock: r.stock !== null ? String(r.stock) : "",
          categoryId: r.suggestedCategoryId ?? defaultCategoryId,
          options: r.options.join(", "),
          include: true,
        })
      );

      setRows(parsedRows);
      if (parsedRows.length === 0) {
        setError("No se detectaron productos automáticamente. Puedes agregarlos a mano abajo.");
      }
    } catch {
      setError("Ocurrió un error al leer el archivo.");
    } finally {
      setStatus("idle");
    }
  }

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function addEmptyRow() {
    setRows((current) => [
      ...current,
      {
        id: `manual-${crypto.randomUUID()}`,
        name: "",
        price: "",
        stock: "",
        categoryId: defaultCategoryId,
        options: "",
        include: true,
      },
    ]);
  }

  const validRows = rows.filter(
    (row) =>
      row.include &&
      row.name.trim() &&
      row.categoryId &&
      Number.isFinite(Number(row.price)) &&
      Number(row.price) >= 0 &&
      Number.isFinite(Number(row.stock)) &&
      Number(row.stock) >= 0
  );

  async function handleCreate() {
    setStatus("creating");
    setError(null);

    try {
      const result = await createProductsFromImportAction(
        validRows.map((row) => ({
          name: row.name.trim(),
          price: Number(row.price),
          stock: Number(row.stock),
          categoryId: row.categoryId,
          options: row.options
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean),
        }))
      );

      router.push(`/admin/productos?success=${result.created} producto(s) creado(s).`);
    } catch {
      setError("Ocurrió un error al crear los productos.");
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Archivo PDF</label>
        <input
          type="file"
          accept="application/pdf"
          className={FILE_INPUT_CLASS}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        {fileName && <p className="text-xs text-slate-400 mt-1">Archivo: {fileName}</p>}
        {status === "parsing" && <p className="text-sm text-teal-700 mt-2">Leyendo PDF…</p>}
      </div>

      {error && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {(rows.length > 0 || fileName) && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th className="px-3 py-2"></th>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Categoría</th>
                  <th className="px-3 py-2">Precio (COP)</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Opciones</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className={row.include ? "" : "opacity-40"}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={row.include}
                        onChange={(e) => updateRow(row.id, { include: e.target.checked })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(row.id, { name: e.target.value })}
                        className="w-56 rounded-md border-slate-300 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={row.categoryId}
                        onChange={(e) => updateRow(row.id, { categoryId: e.target.value })}
                        className="rounded-md border-slate-300 text-sm"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={row.price}
                        onChange={(e) => updateRow(row.id, { price: e.target.value })}
                        className="w-28 rounded-md border-slate-300 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={row.stock}
                        onChange={(e) => updateRow(row.id, { stock: e.target.value })}
                        className="w-20 rounded-md border-slate-300 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.options}
                        onChange={(e) => updateRow(row.id, { options: e.target.value })}
                        placeholder="Copa, Disco, Punta"
                        className="w-40 rounded-md border-slate-300 text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-slate-400">
                      Sin filas todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100">
            <button
              type="button"
              onClick={addEmptyRow}
              className="text-sm text-teal-700 hover:underline"
            >
              + Agregar fila manual
            </button>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <button
          type="button"
          disabled={validRows.length === 0 || status === "creating"}
          onClick={handleCreate}
          className="bg-teal-700 text-white px-5 py-2.5 rounded-md font-medium hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "creating"
            ? "Creando…"
            : `Crear ${validRows.length} producto${validRows.length === 1 ? "" : "s"}`}
        </button>
      )}
      <p className="text-xs text-slate-400">
        Solo se crean las filas marcadas con datos completos (nombre, categoría, precio y stock).
      </p>
    </div>
  );
}
