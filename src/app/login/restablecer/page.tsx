import Image from "next/image";
import Link from "next/link";
import { resetPasswordAction } from "./actions";

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/login/restablecer">) {
  const { token, error } = await searchParams;
  const tokenValue = typeof token === "string" ? token : "";
  const errorMessage = typeof error === "string" ? error : undefined;

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
          <p className="text-sm text-muted-foreground mt-3">Elegir nueva contraseña</p>
        </div>

        {!tokenValue ? (
          <p className="text-sm text-danger">
            Enlace inválido. Solicita uno nuevo desde &quot;¿Olvidaste tu contraseña?&quot;.
          </p>
        ) : (
          <form action={resetPasswordAction} className="space-y-4">
            <input type="hidden" name="token" value={tokenValue} />

            {errorMessage && (
              <div className="rounded-lg bg-danger/10 border border-danger/30 text-danger px-4 py-3 text-sm">
                {errorMessage}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1">
                Nueva contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                minLength={8}
                required
                autoFocus
                className="w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:opacity-90"
            >
              Guardar nueva contraseña
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
