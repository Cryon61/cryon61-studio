import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND"
  | "RATE_LIMITED" | "CONFLICT" | "INVALID_CREDENTIALS" | "BANNED"
  | "CSRF_FAILED" | "INTERNAL_ERROR";

export class ApiError extends Error {
  constructor(public code: ApiErrorCode, message: string, public status = 400, public details?: unknown) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(code: ApiErrorCode, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ success: false, error: { code, message, details } }, { status });
}

/** Wraps a handler so every error maps to the consistent response envelope. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof ApiError) return fail(e.code, e.message, e.status, e.details);
      if (e instanceof ZodError) return fail("VALIDATION_ERROR", "Invalid request", 422, e.flatten().fieldErrors);
      console.error("[api]", e);
      return fail("INTERNAL_ERROR", "Something went wrong", 500);
    }
  };
}
