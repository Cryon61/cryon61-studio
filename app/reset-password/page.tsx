import { Suspense } from "react";
import { AuthShell } from "@/components/ui/AuthShell";
import { AuthForm } from "@/components/ui/AuthForm";

export const metadata = { title: "Reset password" };

export default function ResetPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? "";
  return (
    <AuthShell title="Reset password" subtitle="Choose a new password.">
      <Suspense>
        <AuthForm
          endpoint="/api/auth/reset-password" submitLabel="RESET PASSWORD" hidden={{ token }}
          successMessage="Password updated. You can now log in with your new password."
          fields={[
            { name: "password", label: "New password", type: "password", autoComplete: "new-password" },
            { name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password" },
          ]}
        />
      </Suspense>
    </AuthShell>
  );
}
