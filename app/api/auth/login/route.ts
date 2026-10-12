import { prisma } from "@/lib/database/prisma";
import { handle, ok, ApiError } from "@/lib/utils/api";
import { loginSchema } from "@/lib/auth/validation";
import { verifyPassword, getDummyHash } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { assertSameOrigin, enforceRateLimit, clientIp } from "@/lib/security/request";
import { audit } from "@/lib/security/audit";

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  const input = loginSchema.parse(await req.json());
  enforceRateLimit(req, "login-ip", 20, 15 * 60_000);
  enforceRateLimit(req, "login-email", 8, 15 * 60_000, input.email);

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const valid = await verifyPassword(input.password, user?.passwordHash ?? getDummyHash());

  if (!user || !valid) {
    await audit("LOGIN_FAILED", { req, actorId: user?.id, meta: { email: input.email } });
    throw new ApiError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }
  if (user.banned) throw new ApiError("BANNED", "This account has been suspended", 403);

  await createSession(user.id, { ip: clientIp(req), userAgent: req.headers.get("user-agent") ?? undefined });
  await audit(user.role === "USER" || user.role === "SELLER" ? "USER_LOGIN" : "ADMIN_LOGIN", {
    req, actorId: user.id, entity: "User", entityId: user.id,
  });

  return ok({ id: user.id, username: user.username, role: user.role, emailVerified: !!user.emailVerified });
});
