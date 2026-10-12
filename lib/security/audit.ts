import { prisma } from "@/lib/database/prisma";
import { clientIp } from "./request";

export async function audit(
  action: string,
  opts: { req?: Request; actorId?: string | null; entity?: string; entityId?: string; meta?: Record<string, unknown> } = {},
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        actorId: opts.actorId ?? null,
        entity: opts.entity,
        entityId: opts.entityId,
        ip: opts.req ? clientIp(opts.req) : undefined,
        userAgent: opts.req?.headers.get("user-agent")?.slice(0, 255),
        meta: (opts.meta ?? undefined) as never,
      },
    });
  } catch (e) {
    console.error("[audit] failed", e);
  }
}
