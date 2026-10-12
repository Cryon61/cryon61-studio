import { prisma } from "@/lib/database/prisma";
import { handle, ok, ApiError } from "@/lib/utils/api";
import { verifySchema } from "@/lib/auth/validation";
import { consumeEmailToken } from "@/lib/auth/email-tokens";
import { assertSameOrigin, enforceRateLimit } from "@/lib/security/request";
import { audit } from "@/lib/security/audit";

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  enforceRateLimit(req, "verify", 10, 15 * 60_000);
  const { token } = verifySchema.parse(await req.json());
  const userId = await consumeEmailToken(token, "VERIFY_EMAIL");
  if (!userId) throw new ApiError("VALIDATION_ERROR", "Verification link is invalid or expired", 400);
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
  await audit("EMAIL_VERIFIED", { req, actorId: userId });
  return ok({ verified: true });
});
