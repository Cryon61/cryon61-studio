"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type Field = { name: string; label: string; type?: string; autoComplete?: string };

export function AuthForm({
  endpoint, fields, submitLabel, redirectTo, extra, hidden, successMessage,
}: {
  endpoint: string; fields: Field[]; submitLabel: string; redirectTo?: string;
  extra?: React.ReactNode; hidden?: Record<string, string>; successMessage?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(null); setFieldErrors({});
    const body = { ...Object.fromEntries(new FormData(e.currentTarget)), ...hidden };
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message ?? "Request failed");
        if (json.error?.details) setFieldErrors(json.error.details);
      } else if (successMessage) {
        setDone(true);
      } else if (redirectTo) {
        const next = params.get("next");
        router.push(next && next.startsWith("/") && !next.startsWith("//") ? next : redirectTo);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally { setLoading(false); }
  }

  if (done) return <p role="status" className="rounded-lg border border-line bg-surface p-4 text-sm text-slate-300">{successMessage}</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">{f.label}</label>
          <input id={f.name} name={f.name} type={f.type ?? "text"} autoComplete={f.autoComplete} required className="input" aria-invalid={!!fieldErrors[f.name]} />
          {fieldErrors[f.name] && <p className="mt-1 text-xs text-red-400">{fieldErrors[f.name][0]}</p>}
        </div>
      ))}
      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
      <button className="btn-primary w-full" disabled={loading}>{loading ? "Please wait…" : submitLabel}</button>
      {extra}
    </form>
  );
}
