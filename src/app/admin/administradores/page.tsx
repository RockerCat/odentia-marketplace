import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import FlashMessage from "../flash-message";
import { deleteAdminAction } from "./actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

export default async function AdminAccountsPage({
  searchParams,
}: PageProps<"/admin/administradores">) {
  const { success, error } = await searchParams;

  const [admins, currentUser] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
    getCurrentUser(),
  ]);

  return (
    <div>
      <FlashMessage
        success={typeof success === "string" ? success : undefined}
        error={typeof error === "string" ? error : undefined}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Administradores</h1>
        <Link
          href="/admin/administradores/nuevo"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
        >
          + Nuevo administrador
        </Link>
      </div>

      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted-foreground text-left">
            <tr>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Correo</th>
              <th className="px-5 py-3">Creado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-foreground/5">
                <td className="px-5 py-3 font-medium text-foreground">
                  {admin.name}
                  {admin.id === currentUser?.id && (
                    <span className="ml-2 text-xs text-muted-foreground">(tú)</span>
                  )}
                </td>
                <td className="px-5 py-3 text-muted-foreground">{admin.email}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {admin.createdAt.toLocaleDateString("es-CO")}
                </td>
                <td className="px-5 py-3 text-right space-x-3">
                  <Link
                    href={`/admin/administradores/${admin.id}/editar`}
                    className="text-primary hover:underline"
                  >
                    Editar
                  </Link>
                  {admin.id !== currentUser?.id && (
                    <form action={deleteAdminAction} className="inline">
                      <input type="hidden" name="id" value={admin.id} />
                      <ConfirmSubmitButton
                        confirmMessage={`¿Eliminar a ${admin.name}?`}
                        className="text-danger hover:underline"
                      >
                        Eliminar
                      </ConfirmSubmitButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
