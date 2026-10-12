import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/ui/AuthShell";
import { AuthForm } from "@/components/ui/AuthForm";

export const metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create account" subtitle="Join the Roblox creator marketplace.">
      <Suspense>
        <AuthForm
          endpoint="/api/auth/register" submitLabel="CREATE ACCOUNT" redirectTo="/dashboard"
          fields={[
            { name: "username", label: "Username", autoComplete: "username" },
            { name: "email", label: "Email", type: "email", autoComplete: "email" },
            { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
            { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" },
          ]}
          extra={<p className="text-center text-sm text-slate-400">Already have an account? <Link href="/login" className="text-brand-soft hover:text-white">Login</Link></p>}
        />
      </Suspense>
    </AuthShell>
  );
}
