import { cookies } from "next/headers";
import { prisma } from "@/lib/database/prisma";
import { randomToken, sha256 } from "@/lib/security/tokens";
import { ApiError } from "@/lib/utils/api";
import type { Role } from "@prisma/client";
import { hasRole } from "./session-roles";

export const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-c61_session" : "c61_session";
const SESSION_DAYS = 14;

export async function createSession(userId: string, meta: { ip?: string; userAgent?: string }) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await prisma.session.create({
    data: { tokenHash: sha256(token), userId, expiresAt, ip: meta.ip, userAgent: meta.userAgent?.slice(0, 255) },
  });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  cookies().delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: { include: { profile: true } } },
  });
  if (!session || session.expiresAt < new Date() || session.user.banned) return null;
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError("UNAUTHORIZED", "Authentication required", 401);
  return user;
}

export { hasRole };

export async function requireRole(min: Role) {
  const user = await requireUser();
  if (!hasRole(user.role, min)) throw new ApiError("FORBIDDEN", "You do not have access", 403);
  return user;
}
