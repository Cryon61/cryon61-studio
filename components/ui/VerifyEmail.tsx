"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export function VerifyEmail({ token }: { token: string }) {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  useEffect(() => {
    fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then((r) => r.json()).then((j) => setState(j.success ? "ok" : "error")).catch(() => setState("error"));
  }, [token]);
  return (
    <div role="status" className="space-y-4 text-sm text-slate-300">
      <p>{state === "loading" ? "Verifying…" : state === "ok" ? "Your email has been verified." : "This verification link is invalid or expired."}</p>
      {state !== "loading" && <Link href="/dashboard" className="btn-primary">Continue</Link>}
    </div>
  );
}
