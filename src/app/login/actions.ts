"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

// Not a real credential — a fixed bcrypt hash (cost 10, matching the cost
// used to hash real admin passwords, see prisma/seed.ts) of an arbitrary
// string that was never anyone's password. Compared against when no user
// is found, so a nonexistent email and a wrong password both pay the same
// bcrypt cost and take comparable time. Without this, `!user` short-
// circuited the check below and skipped bcrypt.compare() entirely for a
// nonexistent email, making an account's existence observable from
// response timing alone.
const DUMMY_PASSWORD_HASH = "$2b$10$evbRA0pQ8n49lsEvaE4CV.6bKQIFlj7STrly6Fw3CAYy2dYLCNV3e";

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  // Always runs, whether or not a user was found — never short-circuited.
  const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_PASSWORD_HASH);

  // Requires both a real user AND a real password match — a match against
  // the dummy hash alone (impossible in practice, but not relied upon)
  // could never authenticate, since `user` is still absent.
  if (!user || !passwordMatches) {
    return { error: "Las credenciales no coinciden con nuestros registros." };
  }

  await createSession(user.id);
  redirect("/admin");
}
