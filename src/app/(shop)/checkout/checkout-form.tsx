"use client";

import { useActionState } from "react";
import { placeOrderAction } from "./actions";

export default function CheckoutForm() {
  const [state, action, pending] = useActionState(placeOrderAction, undefined);

  return (
    <form action={action} className="flex-1 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
        <input type="text" name="customerName" className="w-full rounded-md border-slate-300" />
        {state?.errors?.customerName && (
          <p className="text-sm text-red-600 mt-1">{state.errors.customerName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
        <input type="email" name="customerEmail" className="w-full rounded-md border-slate-300" />
        {state?.errors?.customerEmail && (
          <p className="text-sm text-red-600 mt-1">{state.errors.customerEmail}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
        <input type="text" name="customerPhone" className="w-full rounded-md border-slate-300" />
        {state?.errors?.customerPhone && (
          <p className="text-sm text-red-600 mt-1">{state.errors.customerPhone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Dirección de entrega</label>
        <textarea name="address" rows={3} className="w-full rounded-md border-slate-300" />
        {state?.errors?.address && (
          <p className="text-sm text-red-600 mt-1">{state.errors.address}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
        <textarea name="notes" rows={2} className="w-full rounded-md border-slate-300" />
      </div>

      <p className="text-sm text-slate-400">
        El pago se coordina directamente con Odentia luego de confirmar el pedido (transferencia o
        contra-entrega).
      </p>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-teal-700 text-white px-6 py-3 rounded-md font-medium hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Confirmar pedido"}
      </button>
    </form>
  );
}
