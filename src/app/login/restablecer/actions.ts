"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashPasswordResetToken } from "@/lib/password-reset";

const MIN_PASSWORD_LENGTH = 8;

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!token) redirect("/login/olvide-password");

  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect(
      `/login/restablecer?token=${encodeURIComponent(token)}&error=${encodeURIComponent(
        `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
      )}`
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash: hashPasswordResetToken(token),
      resetTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    redirect(
      `/login/restablecer?token=${encodeURIComponent(token)}&error=${encodeURIComponent(
        "El enlace es inválido o ya expiró. Solicita uno nuevo."
      )}`
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(password, 10),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
  });

  redirect(`/login?success=${encodeURIComponent("Contraseña actualizada. Ya puedes iniciar sesión.")}`);
}
