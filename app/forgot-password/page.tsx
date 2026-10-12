import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/ui/AuthShell";
import { AuthForm } from "@/components/ui/AuthForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <AuthShell title="Forgot password" subtitle="We'll email you a reset link.">
      <Suspense>
        <AuthForm
          endpoint="/api/auth/forgot-password" submitLabel="SEND RESET LINK"
          successMessage="If that email exists, a reset link has been sent."
          fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]}
          extra={<p className="text-center text-sm"><Link href="/login" className="text-slate-400 hover:text-white">Back to login</Link></p>}
        />
      </Suspense>
    </AuthShell>
  );
}
