import { AuthShell } from "@/components/ui/AuthShell";
import { VerifyEmail } from "@/components/ui/VerifyEmail";

export const metadata = { title: "Verify email" };

export default function VerifyPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <AuthShell title="Email verification">
      {searchParams.token ? <VerifyEmail token={searchParams.token} /> : <p className="text-sm text-slate-400">Missing verification token.</p>}
    </AuthShell>
  );
}
