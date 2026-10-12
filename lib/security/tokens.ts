import { createHash, randomBytes, timingSafeEqual } from "crypto";

export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");
export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export function safeEqual(a: string, b: string) {
  const A = Buffer.from(a), B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}
