import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/database/prisma';
import { Navbar } from '@/components/site/Navbar';

export const dynamic = 'force-dynamic';

function formatDate(date: Date | null) {
  if (!date) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function licenseStatusClass(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';

    case 'EXPIRED':
      return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';

    case 'REVOKED':
      return 'border-red-500/30 bg-red-500/10 text-red-300';

    default:
      return 'border-line bg-bg text-slate-300';
  }
}

function licenseStatusLabel(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'Active';

    case 'EXPIRED':
      return 'Expired';

    case 'REVOKED':
      return 'Revoked';

    default:
      return status;
  }
}

function licenseTypeLabel(type: string) {
  switch (type) {
    case 'PERSONAL':
      return 'Personal';

    case 'COMMERCIAL':
      return 'Commercial';

    case 'UNLIMITED':
      return 'Unlimited';

    default:
      return type;
  }
}

function licenseModeLabel(mode: string) {
  switch (mode) {
    case 'REQUIRED':
      return 'License Required';

    case 'OPTIONAL':
      return 'License Optional';

    case 'NONE':
      return 'No License';

    default:
      return mode;
  }
}

function sourceModeLabel(mode: string) {
  switch (mode) {
    case 'OPEN_SOURCE':
      return 'Open Source';

    case 'CLOSED_SOURCE':
      return 'Closed Source';

    default:
      return mode;
  }
}

export default async function LicenseDetailPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const license = await prisma.license.findUnique({
    where: {
      id: params.id,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          licenseType: true,
          licenseMode: true,
          sourceMode: true,
          robloxCompat: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          status: true,
        },
      },
    },
  });

  if (!license) {
    notFound();
  }

  if (license.userId !== user.id) {
    notFound();
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8">
          <Link
            href="/dashboard/products"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to My Products
          </Link>

          <div className="mt-5">
            <p className="text-sm font-medium text-purple-300">
              CRYON61 STUDIO
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              License Details
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Informasi lisensi produk yang terhubung dengan akun kamu.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-2xl border border-line bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Product
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {license.product.name}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {license.product.description}
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${licenseStatusClass(
                  license.status,
                )}`}
              >
                {licenseStatusLabel(license.status)}
              </span>
            </div>

            <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/5 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                License Key
              </p>

              <p className="mt-2 break-all font-mono text-sm font-medium text-purple-200">
                {license.key}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-bg p-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  License Type
                </p>

                <p className="mt-1 text-sm font-medium text-slate-200">
                  {licenseTypeLabel(license.product.licenseType)}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-bg p-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  License Mode
                </p>

                <p className="mt-1 text-sm font-medium text-slate-200">
                  {licenseModeLabel(license.product.licenseMode)}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-bg p-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Source
                </p>

                <p className="mt-1 text-sm font-medium text-slate-200">
                  {sourceModeLabel(license.product.sourceMode)}
                </p>
              </div>

              <div className="rounded-xl border border-line bg-bg p-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  Roblox Compatibility
                </p>

                <p className="mt-1 text-sm font-medium text-slate-200">
                  {license.product.robloxCompat || 'Not specified'}
                </p>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-line bg-card p-6">
              <h2 className="text-lg font-semibold text-white">
                License Information
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Created
                  </p>

                  <p className="mt-1 text-sm text-slate-200">
                    {formatDate(license.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Expires
                  </p>

                  <p className="mt-1 text-sm text-slate-200">
                    {formatDate(license.expiresAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Roblox User ID
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-200">
                    {license.robloxUserId || 'Not linked'}
                  </p>
                </div>
              </div>
            </section>

            {license.order && (
              <section className="rounded-2xl border border-line bg-card p-6">
                <h2 className="text-lg font-semibold text-white">
                  Purchase
                </h2>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Order Number
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-200">
                      {license.order.orderNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Order Date
                    </p>

                    <p className="mt-1 text-sm text-slate-200">
                      {formatDate(license.order.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Order Status
                    </p>

                    <p className="mt-1 text-sm font-medium text-emerald-300">
                      {license.order.status}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/marketplace/${license.product.slug}`}
                className="btn-primary !px-4 !py-2 text-sm"
              >
                Product Details
              </Link>

              <Link
                href="/dashboard/products"
                className="btn-ghost !px-4 !py-2 text-sm"
              >
                My Products
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}