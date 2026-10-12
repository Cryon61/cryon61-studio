import { prisma } from "@/lib/database/prisma";
import { handle, ok, ApiError } from "@/lib/utils/api";
import { resetSchema } from "@/lib/auth/validation";
import { hashPassword } from "@/lib/auth/password";
import { consumeEmailToken } from "@/lib/auth/email-tokens";
import { assertSameOrigin, enforceRateLimit } from "@/lib/security/request";
import { audit } from "@/lib/security/audit";

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  enforceRateLimit(req, "reset", 10, 15 * 60_000);
  const input = resetSchema.parse(await req.json());

  const userId = await consumeEmailToken(input.token, "RESET_PASSWORD");
  if (!userId) throw new ApiError("VALIDATION_ERROR", "Reset link is invalid or expired", 400);

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(input.password) } }),
    prisma.session.deleteMany({ where: { userId } }), // log out everywhere
  ]);
  await audit("PASSWORD_RESET", { req, actorId: userId, entity: "User", entityId: userId });
  return ok({ reset: true });
});
