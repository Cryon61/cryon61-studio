import { handle, ok } from "@/lib/utils/api";
import { destroySession } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/security/request";

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  await destroySession();
  return ok({ loggedOut: true });
});
