"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession, getCurrentUser } from "@/lib/dal";

const MIN_PASSWORD_LENGTH = 8;

export async function createAdminAction(formData: FormData) {
  await verifySession();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email) {
    redirect("/admin/administradores/nuevo?error=Nombre y correo son obligatorios.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect(
      `/admin/administradores/nuevo?error=La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    );
  }

  try {
    await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 10) },
    });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      redirect("/admin/administradores/nuevo?error=Ya existe un administrador con ese correo.");
    }
    throw e;
  }

  redirect("/admin/administradores?success=Administrador creado.");
}

export async function updateAdminAction(formData: FormData) {
  await verifySession();

  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email) {
    redirect(`/admin/administradores/${id}/editar?error=Nombre y correo son obligatorios.`);
  }
  if (password && password.length < MIN_PASSWORD_LENGTH) {
    redirect(
      `/admin/administradores/${id}/editar?error=La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
    );
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
      },
    });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      redirect(`/admin/administradores/${id}/editar?error=Ya existe un administrador con ese correo.`);
    }
    throw e;
  }

  redirect("/admin/administradores?success=Administrador actualizado.");
}

export async function deleteAdminAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const id = String(formData.get("id"));

  if (id === currentUser.id) {
    redirect("/admin/administradores?error=No puedes eliminar tu propia cuenta.");
  }

  const adminCount = await prisma.user.count();
  if (adminCount <= 1) {
    redirect("/admin/administradores?error=Debe quedar al menos un administrador.");
  }

  await prisma.user.delete({ where: { id } });

  redirect("/admin/administradores?success=Administrador eliminado.");
}
