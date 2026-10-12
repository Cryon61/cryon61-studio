import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/ui/AuthShell";
import { AuthForm } from "@/components/ui/AuthForm";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Login to your CRYON61 STUDIO account.">
      <Suspense>
        <AuthForm
          endpoint="/api/auth/login" submitLabel="LOGIN" redirectTo="/dashboard"
          fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "password", label: "Password", type: "password", autoComplete: "current-password" }]}
          extra={<div className="flex justify-between text-sm text-slate-400">
            <Link href="/forgot-password" className="hover:text-white">Forgot password?</Link>
            <Link href="/register" className="hover:text-white">Create account</Link>
          </div>}
        />
      </Suspense>
    </AuthShell>
  );
}
