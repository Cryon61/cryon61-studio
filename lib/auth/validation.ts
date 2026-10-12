import { z } from "zod";

export const usernameSchema = z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscore only");
export const passwordSchema = z.string().min(8, "Minimum 8 characters").max(128)
  .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), "Must contain letters and numbers");

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().trim().toLowerCase().email().max(254),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});
export const forgotSchema = z.object({ email: z.string().trim().toLowerCase().email() });
export const resetSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export const verifySchema = z.object({ token: z.string().min(20).max(200) });
