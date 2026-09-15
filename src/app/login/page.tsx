import Image from "next/image";
import Link from "next/link";
import LoginForm from "./login-form";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
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
          <p className="text-sm text-muted-foreground mt-3">Panel de administración</p>
        </div>

        {successMessage && (
          <div className="rounded-lg bg-success/10 border border-success/30 text-success px-4 py-3 text-sm mb-4">
            {successMessage}
          </div>
        )}

        <LoginForm />

        <Link
          href="/"
          className="block text-center text-sm text-muted-foreground hover:text-primary mt-6"
        >
          &larr; Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
