import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

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
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
}

function orderStatusClass(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';

    case 'PAID':
      return 'border-blue-500/30 bg-blue-500/10 text-blue-300';

    case 'PROCESSING':
      return 'border-purple-500/30 bg-purple-500/10 text-purple-300';

    case 'PENDING':
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';

    case 'CANCELLED':
    case 'REFUNDED':
      return 'border-red-500/30 bg-red-500/10 text-red-300';

    default:
      return 'border-line bg-bg text-slate-400';
  }
}

function paymentStatusClass(status: string | null | undefined) {
  switch (status) {
    case 'PAID':
      return 'text-emerald-300';

    case 'PENDING':
      return 'text-yellow-300';

    case 'FAILED':
    case 'EXPIRED':
      return 'text-red-300';

    default:
      return 'text-slate-400';
  }
}

export default async function AdminOrderDetail({
  params,
}: {
  params: { id: string };
}) {
  try {
    await requireRole('ADMIN');
  } catch {
    try {
      await requireRole('OWNER');
    } catch {
      redirect('/dashboard');
    }
  }

  const order = await prisma.order.findUnique({
    where: {
      id: params.id,
    },

    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      },

      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              licenseType: true,
              licenseMode: true,
              sourceMode: true,
            },
          },
        },
      },

      payments: {
        orderBy: {
          createdAt: 'desc',
        },
      },

      licenses: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-400">
              CRYON61 STUDIO
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Order Detail
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {order.orderNumber}
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="btn-ghost w-fit"
          >
            ← Back to Orders
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* ORDER INFORMATION */}
            <section className="card overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-white">
                      Order Information
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Detail transaksi dan status order.
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${orderStatusClass(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">
                    Order Number
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-white">
                    {order.orderNumber}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Order ID
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-400">
                    {order.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Created
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Updated
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>
            </section>

            {/* CUSTOMER */}
            <section className="card overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <h2 className="font-bold text-white">
                  Customer
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Informasi akun pembeli.
                </p>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">
                    Username
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {order.user.username}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-300">
                    {order.user.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    User ID
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-400">
                    {order.user.id}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Role
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-300">
                    {order.user.role}
                  </p>
                </div>
              </div>
            </section>

            {/* PRODUCTS */}
            <section className="card overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <h2 className="font-bold text-white">
                  Products
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Produk yang terdapat dalam order ini.
                </p>
              </div>

              <div className="divide-y divide-line">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">
                          {item.name}
                        </p>

                        <p className="mt-1 break-all text-xs text-slate-600">
                          Product ID: {item.productId}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-md border border-line bg-bg px-2 py-1 text-[10px] text-slate-400">
                            {item.product.licenseType}
                          </span>

                          <span className="rounded-md border border-line bg-bg px-2 py-1 text-[10px] text-slate-400">
                            License: {item.product.licenseMode}
                          </span>

                          <span className="rounded-md border border-line bg-bg px-2 py-1 text-[10px] text-slate-400">
                            {item.product.sourceMode === 'OPEN_SOURCE'
                              ? 'Open Source'
                              : 'Closed Source'}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 sm:text-right">
                        <p className="font-bold text-white">
                          {formatIDR(item.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PAYMENT */}
            <section className="card overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <h2 className="font-bold text-white">
                  Payment
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Riwayat payment provider untuk order ini.
                </p>
              </div>

              {order.payments.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">
                  Belum ada payment record.
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {order.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-5"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-slate-500">
                            Provider
                          </p>

                          <p className="mt-1 text-sm font-semibold text-white">
                            {payment.provider}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Method
                          </p>

                          <p className="mt-1 text-sm text-slate-300">
                            {payment.method || '—'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Status
                          </p>

                          <p
                            className={`mt-1 text-sm font-semibold ${paymentStatusClass(
                              payment.status,
                            )}`}
                          >
                            {payment.status}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Amount
                          </p>

                          <p className="mt-1 text-sm font-semibold text-white">
                            {formatIDR(payment.amount)}
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-xs text-slate-500">
                            Provider Reference
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-400">
                            {payment.providerRef || '—'}
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-xs text-slate-500">
                            Created
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(payment.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* LICENSES */}
            <section className="card overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <h2 className="font-bold text-white">
                  Licenses
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  License yang dibuat untuk order ini.
                </p>
              </div>

              {order.licenses.length === 0 ? (
                <div className="p-5">
                  <p className="text-sm text-slate-500">
                    Tidak ada license yang dibuat untuk order ini.
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Produk mungkin menggunakan No License atau License
                    Optional.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {order.licenses.map((license) => (
                    <div
                      key={license.id}
                      className="p-5"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <p className="text-xs text-slate-500">
                            License Key
                          </p>

                          <p className="mt-1 break-all rounded-lg border border-line bg-bg p-3 font-mono text-xs text-purple-300">
                            {license.key}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Product
                          </p>

                          <p className="mt-1 text-sm text-slate-300">
                            {license.product.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Status
                          </p>

                          <p className="mt-1 text-sm font-semibold text-emerald-300">
                            {license.status}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Roblox User ID
                          </p>

                          <p className="mt-1 text-sm text-slate-300">
                            {license.robloxUserId || 'Belum di-link'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Created
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(license.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <section className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Order Total
              </p>

              <p className="mt-2 text-3xl font-black text-white">
                {formatIDR(order.total)}
              </p>

              <div className="mt-5 space-y-3 border-t border-line pt-4">
                <div className="flex justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Subtotal
                  </span>

                  <span className="text-xs text-slate-300">
                    {formatIDR(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Discount
                  </span>

                  <span className="text-xs text-slate-300">
                    -{formatIDR(order.discountTotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-3 border-t border-line pt-3">
                  <span className="text-sm font-semibold text-white">
                    Total
                  </span>

                  <span className="text-sm font-black text-white">
                    {formatIDR(order.total)}
                  </span>
                </div>
              </div>
            </section>

            <section className="card p-5">
              <h2 className="font-bold text-white">
                Order Actions
              </h2>

              <div className="mt-4 grid gap-2">
                <Link
                  href="/admin/orders"
                  className="rounded-lg border border-line bg-bg px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:border-purple-500/30 hover:text-white"
                >
                  ← Back to Orders
                </Link>

                <Link
                  href="/admin/products"
                  className="rounded-lg border border-line bg-bg px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:border-purple-500/30 hover:text-white"
                >
                  Manage Products
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}