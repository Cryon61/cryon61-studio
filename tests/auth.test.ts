import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, resetSchema } from "@/lib/auth/validation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/security/rate-limit";
import { randomToken, sha256, safeEqual } from "@/lib/security/tokens";
import { hasRole } from "@/lib/auth/session-roles";

const valid = { username: "cryon_dev", email: "A@B.com", password: "Passw0rd123", confirmPassword: "Passw0rd123" };

describe("validation", () => {
  it("accepts valid registration and lowercases email", () => {
    expect(registerSchema.parse(valid).email).toBe("a@b.com");
  });
  it("rejects mismatched passwords", () => {
    expect(() => registerSchema.parse({ ...valid, confirmPassword: "x" })).toThrow();
  });
  it("rejects weak passwords and bad usernames", () => {
    expect(() => registerSchema.parse({ ...valid, password: "short", confirmPassword: "short" })).toThrow();
    expect(() => registerSchema.parse({ ...valid, username: "bad name!" })).toThrow();
  });
  it("login and reset schemas validate", () => {
    expect(() => loginSchema.parse({ email: "nope", password: "x" })).toThrow();
    expect(() => resetSchema.parse({ token: "x", password: "Passw0rd123", confirmPassword: "Passw0rd123" })).toThrow();
  });
});

describe("password hashing", () => {
  it("never stores plaintext and verifies", async () => {
    const h = await hashPassword("Passw0rd123");
    expect(h).not.toContain("Passw0rd123");
    expect(await verifyPassword("Passw0rd123", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  }, 20000);
});

describe("rate limit", () => {
  it("blocks after limit", () => {
    const k = "t:" + Math.random();
    expect(rateLimit(k, 2, 1000).allowed).toBe(true);
    expect(rateLimit(k, 2, 1000).allowed).toBe(true);
    expect(rateLimit(k, 2, 1000).allowed).toBe(false);
  });
});

describe("tokens", () => {
  it("are random, hashed and compared safely", () => {
    const a = randomToken(), b = randomToken();
    expect(a).not.toBe(b);
    expect(sha256(a)).toHaveLength(64);
    expect(safeEqual(a, a)).toBe(true);
    expect(safeEqual(a, b)).toBe(false);
  });
});

describe("RBAC", () => {
  it("ranks roles", () => {
    expect(hasRole("OWNER", "ADMIN")).toBe(true);
    expect(hasRole("ADMIN", "OWNER")).toBe(false);
    expect(hasRole("USER", "SELLER")).toBe(false);
  });
});
