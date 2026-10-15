import Link from "next/link";

import { Logo } from "@/components/ui/Logo";
import { MobileMenu } from "@/components/site/MobileMenu";
import { getCurrentUser } from "@/lib/auth/session";

export async function Navbar() {
  const user = await getCurrentUser();

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.role === "OWNER";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-6">
        {/* Desktop logo */}
        <div className="hidden sm:block">
          <Logo size={34} />
        </div>

        {/* Mobile logo */}
        <div className="sm:hidden">
          <Logo size={32} withText={false} />
        </div>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-5 text-sm text-slate-400 lg:flex">
          <Link
            className="hover:text-white"
            href="/marketplace"
          >
            Marketplace
          </Link>

          <Link
            className="hover:text-white"
            href="/marketplace?sort=best"
          >
            Best Sellers
          </Link>

          <Link
            className="hover:text-white"
            href="/sell"
          >
            Sell
          </Link>

          <Link
            className="hover:text-white"
            href="/support"
          >
            Support
          </Link>
        </nav>

        {/* Desktop search */}
        <form
          action="/marketplace"
          className="ml-auto hidden max-w-sm flex-1 md:flex"
        >
          <input
            name="q"
            className="input"
            placeholder="Search Roblox assets..."
            aria-label="Search products"
          />
        </form>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 text-sm lg:flex">
          <Link
            className="rounded-lg px-3 py-2 text-slate-300 hover:bg-card"
            href="/wishlist"
          >
            ♡
          </Link>

          <Link
            className="rounded-lg px-3 py-2 text-slate-300 hover:bg-card"
            href="/cart"
          >
            Cart
          </Link>

          {isAdmin && (
            <Link
              className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 font-medium text-purple-300 transition hover:border-purple-400/50 hover:bg-purple-500/20 hover:text-white"
              href="/admin"
            >
              Admin Panel
            </Link>
          )}

          {user ? (
            <Link
              className="btn-ghost !px-3 !py-2"
              href="/dashboard"
            >
              {user.username}
            </Link>
          ) : (
            <Link
              className="btn-primary !px-3 !py-2"
              href="/login"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile actions */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Link
            href="/cart"
            className="rounded-xl border border-line bg-card px-3 py-2 text-xs font-semibold text-slate-200"
          >
            Cart
          </Link>

          <MobileMenu
            isAdmin={isAdmin}
            username={user?.username}
          />
        </div>
      </div>
    </header>
  );
}