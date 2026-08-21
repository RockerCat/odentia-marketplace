"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico</label>
        <input type="email" name="email" autoFocus className="w-full rounded-md border-slate-300" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
        <input type="password" name="password" className="w-full rounded-md border-slate-300" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-teal-700 text-white px-4 py-2.5 rounded-md font-medium hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
