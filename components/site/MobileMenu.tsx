"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function MobileMenu({
  isAdmin,
  username,
}: {
  isAdmin: boolean;
  username?: string | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="relative z-40 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-card text-slate-200 transition active:scale-95 lg:hidden"
      >
        <span className="text-xl leading-none">
          {open ? "×" : "☰"}
        </span>
      </button>

      {open && (
        <div
          className="lg:hidden"
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 100000,
          }}
        >
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
              padding: 0,
              backgroundColor: "rgba(0, 0, 0, 0.82)",
              cursor: "default",
            }}
          />

          {/* MENU PANEL */}
          <aside
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              height: "100%",
              width: "86vw",
              maxWidth: "360px",
              backgroundColor: "#08090f",
              borderLeft: "1px solid #202331",
              boxShadow: "-12px 0 40px rgba(0, 0, 0, 0.55)",
              overflowY: "auto",
              zIndex: 100001,
            }}
          >
            {/* HEADER */}
            <div className="flex h-[72px] items-center justify-between px-5">
              <span className="text-[13px] font-bold tracking-[0.18em] text-white">
                CRYON61 STUDIO
              </span>

              <button
                type="button"
                aria-label="Close menu"
                onClick={closeMenu}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-xl leading-none text-slate-200 transition hover:bg-slate-800 active:scale-95"
              >
                ×
              </button>
            </div>

            {/* HEADER SEPARATOR */}
            <div className="mx-5 border-t border-slate-800" />

            {/* MENU LINKS */}
            <nav className="grid gap-2 px-5 pt-5">
              <Link
                href="/marketplace"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-xl border border-slate-800 bg-[#10121a] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-brand/40 hover:bg-[#151827] hover:text-white active:scale-[0.98]"
              >
                Marketplace
              </Link>

              <Link
                href="/marketplace?sort=best"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-xl border border-slate-800 bg-[#10121a] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-brand/40 hover:bg-[#151827] hover:text-white active:scale-[0.98]"
              >
                Best Sellers
              </Link>

              <Link
                href="/sell"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-xl border border-slate-800 bg-[#10121a] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-brand/40 hover:bg-[#151827] hover:text-white active:scale-[0.98]"
              >
                Sell an Asset
              </Link>

              <Link
                href="/support"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-xl border border-slate-800 bg-[#10121a] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-brand/40 hover:bg-[#151827] hover:text-white active:scale-[0.98]"
              >
                Support
              </Link>

              <Link
                href="/wishlist"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-xl border border-slate-800 bg-[#10121a] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-brand/40 hover:bg-[#151827] hover:text-white active:scale-[0.98]"
              >
                Wishlist
              </Link>

              <Link
                href="/cart"
                onClick={closeMenu}
                className="flex min-h-11 items-center rounded-xl border border-slate-800 bg-[#10121a] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-brand/40 hover:bg-[#151827] hover:text-white active:scale-[0.98]"
              >
                Cart
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={closeMenu}
                  className="flex min-h-11 items-center rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-300 transition hover:border-purple-400/50 hover:bg-purple-500/20 hover:text-white active:scale-[0.98]"
                >
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* ACCOUNT */}
            <div className="mx-5 mt-5 border-t border-slate-800 pt-5 pb-5">
              {username ? (
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-soft active:scale-[0.98]"
                >
                  {username}
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-soft active:scale-[0.98]"
                >
                  Login
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}