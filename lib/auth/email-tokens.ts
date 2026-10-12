import type { EmailTokenType } from "@prisma/client";
import { prisma } from "@/lib/database/prisma";
import { randomToken, sha256 } from "@/lib/security/tokens";

const TTL: Record<EmailTokenType, number> = {
  VERIFY_EMAIL: 24 * 3600_000,
  RESET_PASSWORD: 3600_000,
};

export async function issueEmailToken(userId: string, type: EmailTokenType) {
  await prisma.emailToken.deleteMany({ where: { userId, type, usedAt: null } });
  const token = randomToken(32);
  await prisma.emailToken.create({
    data: { userId, type, tokenHash: sha256(token), expiresAt: new Date(Date.now() + TTL[type]) },
  });
  return token;
}

/** Atomically consumes a token (single use). Returns userId or null. */
export async function consumeEmailToken(token: string, type: EmailTokenType) {
  const hash = sha256(token);
  const res = await prisma.emailToken.updateMany({
    where: { tokenHash: hash, type, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  if (res.count !== 1) return null;
  const row = await prisma.emailToken.findUnique({ where: { tokenHash: hash } });
  return row?.userId ?? null;
}
