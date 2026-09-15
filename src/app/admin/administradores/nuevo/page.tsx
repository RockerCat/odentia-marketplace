import Link from "next/link";
import { createAdminAction } from "../actions";
import FlashMessage from "../../flash-message";

export default async function NewAdminPage({
  searchParams,
}: PageProps<"/admin/administradores/nuevo">) {
  const { error } = await searchParams;

  return (
    <div>
      <Link href="/admin/administradores" className="text-sm text-primary hover:underline">
        &larr; Volver a administradores
      </Link>

      <h1 className="text-2xl font-bold text-foreground mt-4 mb-6">Nuevo administrador</h1>

      <FlashMessage error={typeof error === "string" ? error : undefined} />

      <form
        action={createAdminAction}
        className="bg-background rounded-xl border border-border p-6 max-w-md space-y-4"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-1">
            Nombre
          </label>
          <input type="text" id="name" name="name" className="w-full" required />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
            Correo
          </label>
          <input type="email" id="email" name="email" className="w-full" required />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full"
            minLength={8}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90"
        >
          Crear administrador
        </button>
      </form>
    </div>
  );
}
