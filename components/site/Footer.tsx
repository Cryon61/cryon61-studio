import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-2xl font-black tracking-tight text-white">
            CRYON<span className="text-brand-soft">61</span>
          </div>

          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
            Premium Roblox assets, systems, scripts and digital resources for creators.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            Marketplace
          </h3>

          <div className="mt-4 grid gap-2 text-sm text-slate-500">
            <Link href="/marketplace">All Products</Link>
            <Link href="/marketplace?sort=best">Best Sellers</Link>
            <Link href="/marketplace?featured=1">Featured</Link>
            <Link href="/sell">Sell an Asset</Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            Help
          </h3>

          <div className="mt-4 grid gap-2 text-sm text-slate-500">
            <Link href="/support">Support</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/refund-policy">Refund Policy</Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-white">
            CRYON61
          </h3>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Build. Create. Sell.
          </p>

          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <a
              className="text-brand-soft hover:underline"
              href="https://discord.gg/mbjgQAEm9"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord &gt;
            </a>

            <a
              className="text-brand-soft hover:underline"
              href="https://youtube.com/@cryon61"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube &gt;
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-slate-600">
        © 2026 CRYON61 STUDIO. All rights reserved.
      </div>
    </footer>
  );
}