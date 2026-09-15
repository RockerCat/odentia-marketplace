import "server-only";
import { createHash, randomBytes } from "crypto";

const TOKEN_BYTES = 32; // 256 bits of entropy.
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour.

export function generatePasswordResetToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

// The raw token is never persisted — only its hash, looked up directly by
// exact match (see resetPasswordAction), the same "store a hash, look up by
// hash" pattern used by most password-reset implementations.
export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
