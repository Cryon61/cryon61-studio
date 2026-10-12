import { prisma } from "@/lib/database/prisma";
import { handle, ok, ApiError } from "@/lib/utils/api";
import { registerSchema } from "@/lib/auth/validation";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { issueEmailToken } from "@/lib/auth/email-tokens";
import { assertSameOrigin, enforceRateLimit, clientIp } from "@/lib/security/request";
import { audit } from "@/lib/security/audit";
import { mail } from "@/lib/email/mailer";

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  enforceRateLimit(req, "register", 5, 15 * 60_000);
  const input = registerSchema.parse(await req.json());

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { username: { equals: input.username, mode: "insensitive" } }] },
    select: { email: true },
  });
  if (existing) {
    throw new ApiError("CONFLICT", "Email or username is already in use", 409);
  }

  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      profile: { create: {} },
    },
  });

  const token = await issueEmailToken(user.id, "VERIFY_EMAIL");
  const base = process.env.APP_URL ?? "http://localhost:3000";
  mail.verify(user.email, `${base}/verify-email?token=${token}`).catch((e) => console.error("[email]", e));

  await createSession(user.id, { ip: clientIp(req), userAgent: req.headers.get("user-agent") ?? undefined });
  await audit("USER_REGISTER", { req, actorId: user.id, entity: "User", entityId: user.id });

  return ok({ id: user.id, username: user.username, email: user.email, emailVerified: false }, { status: 201 });
});
