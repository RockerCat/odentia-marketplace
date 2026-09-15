import Image from "next/image";
import Link from "next/link";
import { requestPasswordResetAction } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: PageProps<"/login/olvide-password">) {
  const { success } = await searchParams;
  const successMessage = typeof success === "string" ? success : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-full max-w-sm bg-background rounded-xl border border-border p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <Image
            src="/branding/odentia.png"
            alt="Odentia"
            width={124}
            height={37}
            priority
            className="h-12 w-auto"
          />
          <p className="text-sm text-muted-foreground mt-3">Recuperar contraseña</p>
        </div>

        {successMessage ? (
          <div className="rounded-lg bg-success/10 border border-success/30 text-success px-4 py-3 text-sm">
            {successMessage}
          </div>
        ) : (
          <form action={requestPasswordResetAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
                Correo electrónico
              </label>
              <input type="email" id="email" name="email" autoFocus required className="w-full" />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:opacity-90"
            >
              Enviar enlace de recuperación
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="block text-center text-sm text-muted-foreground hover:text-primary mt-6"
        >
          &larr; Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
