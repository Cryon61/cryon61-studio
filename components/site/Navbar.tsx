import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { getCurrentUser } from '@/lib/auth/session';

export async function Navbar() {
  const user = await getCurrentUser();
  return <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/90 backdrop-blur-xl">
    <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4 sm:px-6">
      <Logo size={34} />
      <nav className="hidden items-center gap-5 text-sm text-slate-400 lg:flex">
        <Link className="hover:text-white" href="/marketplace">Marketplace</Link>
        <Link className="hover:text-white" href="/marketplace?sort=best">Best Sellers</Link>
        <Link className="hover:text-white" href="/sell">Sell</Link>
        <Link className="hover:text-white" href="/support">Support</Link>
      </nav>
      <form action="/marketplace" className="ml-auto hidden max-w-sm flex-1 md:flex">
        <input name="q" className="input" placeholder="Search Roblox assets..." aria-label="Search products" />
      </form>
      <div className="flex items-center gap-2 text-sm">
        <Link className="hidden rounded-lg px-3 py-2 text-slate-300 hover:bg-card sm:block" href="/wishlist">♡</Link>
        <Link className="rounded-lg px-3 py-2 text-slate-300 hover:bg-card" href="/cart">Cart</Link>
        {user ? <Link className="btn-ghost !px-3 !py-2" href="/dashboard">{user.username}</Link> : <Link className="btn-primary !px-3 !py-2" href="/login">Login</Link>}
      </div>
    </div>
  </header>;
}
