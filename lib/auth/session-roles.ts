import type { Role } from "@prisma/client";

const RANK: Record<Role, number> = { USER: 0, SELLER: 1, ADMIN: 2, OWNER: 3 };
export const hasRole = (role: Role, min: Role) => RANK[role] >= RANK[min];
