import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateAdminAction } from "../../actions";
import FlashMessage from "../../../flash-message";

export default async function EditAdminPage({
  params,
  searchParams,
}: PageProps<"/admin/administradores/[id]/editar">) {
  const { id } = await params;
  const { error } = await searchParams;

  const admin = await prisma.user.findUnique({ where: { id } });
  if (!admin) notFound();

  return (
    <div>
      <Link href="/admin/administradores" className="text-sm text-primary hover:underline">
        &larr; Volver a administradores
      </Link>

      <h1 className="text-2xl font-bold text-foreground mt-4 mb-6">Editar administrador</h1>

      <FlashMessage error={typeof error === "string" ? error : undefined} />

      <form
        action={updateAdminAction}
        className="bg-background rounded-xl border border-border p-6 max-w-md space-y-4"
      >
        <input type="hidden" name="id" value={admin.id} />

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-1">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={admin.name}
            className="w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
            Correo
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={admin.email}
            className="w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1">
            Nueva contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full"
            minLength={8}
            placeholder="Dejar en blanco para no cambiarla"
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
