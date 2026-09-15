import "server-only";
import { Resend } from "resend";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY / RESEND_FROM_EMAIL no están configuradas.");
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from,
    to,
    subject: "Restablecer contraseña — Odentia",
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña del panel de administración de Odentia.</p>
      <p><a href="${resetUrl}">Haz clic aquí para elegir una nueva contraseña</a></p>
      <p>Este enlace vence en 1 hora. Si no fuiste tú quien lo solicitó, puedes ignorar este correo.</p>
    `,
  });
}
