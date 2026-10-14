'use client';

import Link from 'next/link';
import { useState } from 'react';

type MobileNavbarProps = {
  username: string | null;
  isAdmin: boolean;
};

export function MobileNavbar({
  username,
  isAdmin,
}: MobileNavbarProps) {
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <div className="ml-auto flex items-center gap-1 lg:hidden">
      <Link
        href="/cart"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 text-sm text-slate-300 transition hover:bg-card hover:text-white"
        aria-label="Cart"
      >
        🛒
      </Link>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-xl text-slate-200 transition hover:bg-card hover:text-white"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-line bg-bg shadow-xl">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <form
              action="/marketplace"
              className="mb-4"
              onSubmit={closeMenu}
            >
              <input
                name="q"
                className="input min-h-11 w-full"
                placeholder="Search Roblox assets..."
                aria-label="Search products"
              />
            </form>

            <nav className="grid gap-1">
              <Link
                href="/marketplace"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-300 transition hover:bg-card hover:text-white"
              >
                Marketplace
              </Link>

              <Link
                href="/marketplace?sort=best"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-300 transition hover:bg-card hover:text-white"
              >
                Best Sellers
              </Link>

              <Link
                href="/sell"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-300 transition hover:bg-card hover:text-white"
              >
                Sell
              </Link>

              <Link
                href="/support"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-300 transition hover:bg-card hover:text-white"
              >
                Support
              </Link>

              <Link
                href="/wishlist"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm text-slate-300 transition hover:bg-card hover:text-white"
              >
                ♡ Wishlist
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="mt-1 flex min-h-11 items-center rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 text-sm font-medium text-purple-300 transition hover:border-purple-400/50 hover:bg-purple-500/20 hover:text-white"
                >
                  Admin Panel
                </Link>
              )}

              {username ? (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="mt-1 flex min-h-11 items-center rounded-lg border border-line bg-card px-3 text-sm text-slate-200 transition hover:text-white"
                >
                  Dashboard · {username}
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="btn-primary mt-1 flex min-h-11 items-center justify-center"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}