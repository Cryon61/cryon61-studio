import Link from 'next/link';
import { redirect } from 'next/navigation';

import { requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/database/prisma';
import { Navbar } from '@/components/site/Navbar';

export const dynamic = 'force-dynamic';

function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default async function AdminDashboard() {
  try {
    await requireRole('ADMIN');
  } catch {
    try {
      await requireRole('OWNER');
    } catch {
      redirect('/dashboard');
    }
  }

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalLicenses,
    revenue,
    completedOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.product.count({
      where: {
        status: 'PUBLISHED',
      },
    }),

    prisma.order.count(),

    prisma.license.count({
      where: {
        status: 'ACTIVE',
      },
    }),

    prisma.order.aggregate({
      where: {
        status: 'COMPLETED',
      },
      _sum: {
        total: true,
      },
    }),

    prisma.order.count({
      where: {
        status: 'COMPLETED',
      },
    }),

    prisma.order.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        items: {
          select: {
            name: true,
            total: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
    }),
  ]);

  const totalRevenue = revenue._sum.total ?? 0;

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-400">
              CRYON61 STUDIO
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Kelola marketplace, produk, pesanan, user, dan license
              CRYON61 STUDIO dari satu tempat.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="btn-ghost w-fit"
          >
            ← Marketplace
          </Link>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Revenue
            </p>

            <p className="mt-3 text-2xl font-black text-white">
              {formatIDR(totalRevenue)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Dari {completedOrders} order selesai
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Products
            </p>

            <p className="mt-3 text-2xl font-black text-white">
              {totalProducts}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Produk published
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Orders
            </p>

            <p className="mt-3 text-2xl font-black text-white">
              {totalOrders}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Semua order
            </p>
          </div>

          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Licenses
            </p>

            <p className="mt-3 text-2xl font-black text-white">
              {totalLicenses}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              License aktif
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="font-bold text-white">
                  Recent Orders
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Order terbaru di CRYON61 STUDIO
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300"
              >
                Lihat semua →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm text-slate-500">
                  Belum ada order.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="px-5 py-4 transition hover:bg-white/[0.02]"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {order.orderNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {order.user.username} • {order.user.email}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {order.items.slice(0, 3).map((item, index) => (
                            <span
                              key={`${order.id}-${index}`}
                              className="rounded-md border border-line bg-bg px-2 py-1 text-[11px] text-slate-400"
                            >
                              {item.name}
                            </span>
                          ))}

                          {order.items.length > 3 && (
                            <span className="px-1 py-1 text-[11px] text-slate-600">
                              +{order.items.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="font-bold text-white">
                          {formatIDR(order.total)}
                        </p>

                        <span className="mt-1 inline-block rounded-full border border-line px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {order.status}
                        </span>

                        <p className="mt-1 text-[10px] text-slate-600">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="font-bold text-white">
                Quick Actions
              </h2>

              <div className="mt-4 grid gap-2">
                <Link
                  href="/admin/products"
                  className="rounded-xl border border-line bg-bg px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-purple-500/40 hover:bg-purple-500/5 hover:text-white"
                >
                  📦 Manage Products
                </Link>

                <Link
                  href="/admin/products/new"
                  className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20 hover:text-white"
                >
                  ＋ Add Product
                </Link>

                <Link
                  href="/admin/orders"
                  className="rounded-xl border border-line bg-bg px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-purple-500/40 hover:bg-purple-500/5 hover:text-white"
                >
                  🛒 Manage Orders
                </Link>

                <Link
                  href="/admin/banners"
                  className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20 hover:text-white"
                >
                  🖼️ Manage Hero Banners
                </Link>

                <Link
                  href="/licenses"
                  className="rounded-xl border border-line bg-bg px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-purple-500/40 hover:bg-purple-500/5 hover:text-white"
                >
                  🔑 Manage Licenses
                </Link>
              </div>
            </div>

            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Users
              </p>

              <p className="mt-2 text-2xl font-black text-white">
                {totalUsers}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Total akun terdaftar
              </p>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}