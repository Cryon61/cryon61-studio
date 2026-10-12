import { prisma } from "@/lib/database/prisma";
import { handle, ok } from "@/lib/utils/api";
import { forgotSchema } from "@/lib/auth/validation";
import { issueEmailToken } from "@/lib/auth/email-tokens";
import { assertSameOrigin, enforceRateLimit } from "@/lib/security/request";
import { mail } from "@/lib/email/mailer";

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  enforceRateLimit(req, "forgot", 5, 15 * 60_000);
  const { email } = forgotSchema.parse(await req.json());

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.banned) {
    const token = await issueEmailToken(user.id, "RESET_PASSWORD");
    const base = process.env.APP_URL ?? "http://localhost:3000";
    mail.reset(user.email, `${base}/reset-password?token=${token}`).catch((e) => console.error("[email]", e));
  }
  // Same response either way: no account enumeration.
  return ok({ message: "If that email exists, a reset link has been sent." });
});
