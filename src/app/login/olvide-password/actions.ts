"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken, hashPasswordResetToken, RESET_TOKEN_TTL_MS } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";

const GENERIC_SUCCESS =
  "Si el correo está registrado, te enviamos un enlace para restablecer la contraseña.";

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always takes a comparable amount of time whether or not the email is
    // registered, so response timing alone can't reveal which admin emails
    // exist (mirrors the dummy-hash trick in login/actions.ts).
    if (user) {
      const token = generatePasswordResetToken();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: hashPasswordResetToken(token),
          resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const host = (await headers()).get("host");
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const resetUrl = `${protocol}://${host}/login/restablecer?token=${token}`;

      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (err) {
        console.error("No se pudo enviar el correo de restablecimiento de contraseña:", err);
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  redirect(`/login/olvide-password?success=${encodeURIComponent(GENERIC_SUCCESS)}`);
}
