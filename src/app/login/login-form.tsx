"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 text-danger px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          name="email"
          autoFocus
          className="w-full"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
            Contraseña
          </label>
          <Link href="/login/olvide-password" className="text-xs text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <input type="password" id="password" name="password" className="w-full" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
