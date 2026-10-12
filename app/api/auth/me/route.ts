import { handle, ok, ApiError } from "@/lib/utils/api";
import { getCurrentUser } from "@/lib/auth/session";

export const GET = handle(async () => {
  const user = await getCurrentUser();
  if (!user) throw new ApiError("UNAUTHORIZED", "Authentication required", 401);
  return ok({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    emailVerified: !!user.emailVerified,
    profile: {
      avatarUrl: user.profile?.avatarUrl ?? null,
      robloxUserId: user.profile?.robloxUserId ?? null,
      discordUsername: user.profile?.discordUsername ?? null,
    },
    joinedAt: user.createdAt,
  });
});
