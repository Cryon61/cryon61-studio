import Image from "next/image";
import Link from "next/link";

/** Official CRYON61 STUDIO logo. Uses /public/logo.png untouched; only CSS sizing, aspect ratio preserved. */
export function Logo({ size = 36, withText = true, href = "/" }: { size?: number; withText?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="CRYON61 STUDIO home">
      <Image src="/logo.png" alt="CRYON61 STUDIO" width={size} height={size} priority style={{ width: "auto", height: size }} />
      {withText && <span className="text-sm font-bold tracking-[0.18em] text-white">CRYON61 STUDIO</span>}
    </Link>
  );
}
