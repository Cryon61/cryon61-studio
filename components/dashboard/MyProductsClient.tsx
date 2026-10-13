'use client';

import Link from 'next/link';
import { useState } from 'react';

type DownloadState = {
  loading: boolean;
  error: string | null;
};

type MyProductsClientProps = {
  products: any[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(new Date(date));
}

function formatBytes(bytes: string | number | bigint) {
  const value = Number(bytes);

  if (!Number.isFinite(value) || value <= 0) {
    return 'Unknown size';
  }

  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function MyProductsClient({
  products,
}: MyProductsClientProps) {
  const [downloadStates, setDownloadStates] = useState<
    Record<string, DownloadState>
  >({});

  async function handleDownload(
    fileId: string,
    productId: string,
  ) {
    setDownloadStates((current) => ({
      ...current,
      [fileId]: {
        loading: true,
        error: null,
      },
    }));

    try {
      const response = await fetch(
        '/api/licenses/download-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify({
            fileId,
            productId,
          }),
        },
      );

      let result: {
        data?: {
          url?: string;
        };
        url?: string;
        error?: string;
        message?: string;
      } = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            'Download tidak dapat diproses.',
        );
      }

      const downloadUrl =
        result.data?.url || result.url;

      if (!downloadUrl) {
        throw new Error(
          'URL download tidak ditemukan.',
        );
      }

      setDownloadStates((current) => ({
        ...current,
        [fileId]: {
          loading: false,
          error: null,
        },
      }));

      window.location.href = downloadUrl;
    } catch (error) {
      setDownloadStates((current) => ({
        ...current,
        [fileId]: {
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Download gagal.',
        },
      }));
    }
  }

  if (products.length === 0) {
    return (
      <section className="rounded-2xl border border-line bg-card p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-bg text-2xl">
          📦
        </div>

        <h2 className="mt-5 text-xl font-semibold text-white">
          Belum ada produk
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          Produk yang sudah kamu beli akan muncul di halaman ini.
        </p>

        <Link
          href="/marketplace"
          className="btn-primary mt-6 inline-flex"
        >
          Browse Marketplace
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {products.map((item) => {
        const product = item.product;
        const license = item.license;

        const latestVersion =
          product.versions.find(
            (version: any) => version.isLatest,
          ) ??
          product.versions[0] ??
          null;

        const files = latestVersion?.files.length
          ? latestVersion.files
          : product.files;

        const hasFiles = files.length > 0;

        const requiresLicense =
          product.licenseMode === 'REQUIRED';

        const canDownload =
          !requiresLicense || Boolean(license);

        return (
          <article
            key={product.id}
            className="overflow-hidden rounded-2xl border border-line bg-card"
          >
            <div className="border-b border-line bg-bg/50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-white">
                    {product.name}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Order {item.orderNumber}
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  Purchased
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    Purchased
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {formatDate(item.purchasedAt)}
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-card p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    License
                  </p>

                  <p
                    className={`mt-1 text-sm font-medium ${
                      license
                        ? 'text-emerald-300'
                        : requiresLicense
                          ? 'text-yellow-300'
                          : 'text-slate-300'
                    }`}
                  >
                    {license
                      ? 'Active'
                      : requiresLicense
                        ? 'Required'
                        : 'Not required'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Files
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {latestVersion
                      ? `Version ${latestVersion.version}`
                      : 'No version assigned'}
                  </p>
                </div>

                {latestVersion?.isLatest && (
                  <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs text-purple-300">
                    Latest
                  </span>
                )}
              </div>

              {!hasFiles ? (
                <div className="mt-4 rounded-xl border border-dashed border-line bg-bg p-4 text-sm text-slate-500">
                  File produk belum tersedia.
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {files.map((file: any) => {
                    const state =
                      downloadStates[file.id];

                    return (
                      <div
                        key={file.id}
                        className="rounded-xl border border-line bg-bg p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-200">
                              {file.fileName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatBytes(file.sizeBytes)}
                            </p>
                          </div>

                          {canDownload ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(
                                  file.id,
                                  product.id,
                                )
                              }
                              disabled={state?.loading}
                              className="shrink-0 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-2 text-xs font-medium text-purple-300 transition hover:border-purple-400/50 hover:bg-purple-500/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {state?.loading
                                ? 'Preparing...'
                                : 'Download'}
                            </button>
                          ) : (
                            <span className="shrink-0 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
                              License required
                            </span>
                          )}
                        </div>

                        {state?.error && (
                          <p className="mt-2 text-xs text-red-400">
                            {state.error}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/marketplace/${product.slug}`}
                  className="btn-ghost !px-3 !py-2 text-xs"
                >
                  Product Details
                </Link>

                {license && (
                  <Link
                    href={`/dashboard/licenses/${license.id}`}
                    className="btn-ghost !px-3 !py-2 text-xs"
                  >
                    View License
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}