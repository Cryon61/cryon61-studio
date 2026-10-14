import { notFound } from "next/navigation";
import { prisma } from "@/lib/database/prisma";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { AddToCart } from "@/components/shop/AddToCart";
import { BuyNow } from "@/components/shop/BuyNow";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { FreeDownloadButton } from "@/components/product/FreeDownloadButton";

const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const p = await prisma.product.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      name: true,
      description: true,
      thumbnailUrl: true,
    },
  });

  return p
    ? {
        title: p.name,
        description: p.description,
        openGraph: {
          images: p.thumbnailUrl
            ? [p.thumbnailUrl]
            : ["/logo.png"],
        },
      }
    : {
        title: "Product not found",
      };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = await prisma.product.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      features: true,
      requirements: true,
      price: true,
      discountPercent: true,
      status: true,
      featured: true,
      licenseType: true,
      licenseMode: true,
      sourceMode: true,
      thumbnailUrl: true,
      freeDownloadUrl: true,
      salesCount: true,
      ratingAvg: true,
      ratingCount: true,
      robloxCompat: true,

      categories: {
        include: {
          category: true,
        },
      },

      seller: {
        select: {
          storeName: true,
        },
      },

      versions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },

      reviews: {
        where: {
          status: "APPROVED",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });

  if (!p || p.status !== "PUBLISHED") {
    notFound();
  }

  const final = Math.round(
    (p.price * (100 - p.discountPercent)) / 100,
  );

  const isFree = final <= 0;

  const hasFreeDownload = Boolean(
    p.freeDownloadUrl?.trim(),
  );

  const licenseLabel =
    p.licenseMode === "NONE"
      ? "No License"
      : p.licenseMode === "REQUIRED"
        ? "License Required"
        : "License Optional";

  const sourceLabel =
    p.sourceMode === "OPEN_SOURCE"
      ? "Open Source"
      : "Closed Source";

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-surface">
              {p.thumbnailUrl ? (
                <img
                  src={p.thumbnailUrl}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-7xl font-black text-white/10">
                  C61
                </div>
              )}
            </div>

            <div className="mt-8 card p-6">
              <h2 className="text-xl font-bold text-white">
                About this product
              </h2>

              <p className="mt-4 whitespace-pre-line leading-7 text-slate-400">
                {p.description}
              </p>

              <h3 className="mt-7 font-semibold text-white">
                Features
              </h3>

              <ul className="mt-3 grid gap-2 text-sm text-slate-400">
                {p.features.map((f, i) => (
                  <li key={i}>✓ {f}</li>
                ))}
              </ul>

              {p.requirements && (
                <>
                  <h3 className="mt-7 font-semibold text-white">
                    Requirements
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {p.requirements}
                  </p>
                </>
              )}

              {p.robloxCompat && (
                <>
                  <h3 className="mt-7 font-semibold text-white">
                    Roblox Compatibility
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {p.robloxCompat}
                  </p>
                </>
              )}

              <h3 className="mt-7 font-semibold text-white">
                Distribution
              </h3>

              <div className="mt-3 grid gap-2 text-sm text-slate-500">
                <div>
                  <span className="font-medium text-slate-300">
                    License:
                  </span>{" "}
                  {licenseLabel}
                </div>

                <div>
                  <span className="font-medium text-slate-300">
                    Source:
                  </span>{" "}
                  {sourceLabel}
                </div>
              </div>

              <h3 className="mt-7 font-semibold text-white">
                Latest version
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {p.versions[0]?.version || "1.0.0"} —{" "}
                {p.versions[0]?.changelog ||
                  "Initial release"}
              </p>
            </div>
          </div>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="card p-6">
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {p.categories.map((c) => (
                  <span
                    key={c.categoryId}
                    className="rounded-full bg-surface px-2.5 py-1"
                  >
                    {c.category.name}
                  </span>
                ))}
              </div>

              <h1 className="mt-4 text-3xl font-black text-white">
                {p.name}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                by{" "}
                {p.seller?.storeName ||
                  "CRYON61 STUDIO"}{" "}
                • {p.salesCount} sales • ★{" "}
                {p.ratingCount
                  ? p.ratingAvg.toFixed(1)
                  : "New"}
              </p>

              {/* PRICE */}
              <div className="mt-7">
                {!isFree &&
                  p.discountPercent > 0 && (
                    <div className="text-sm text-slate-600 line-through">
                      {money(p.price)}
                    </div>
                  )}

                {isFree ? (
                  <div className="text-3xl font-black text-emerald-400">
                    FREE
                  </div>
                ) : (
                  <div className="text-3xl font-black text-white">
                    {money(final)}
                  </div>
                )}
              </div>

              <div className="mt-6 grid gap-3">
                {isFree ? (
                  <>
                    {hasFreeDownload &&
                    p.freeDownloadUrl ? (
                      <FreeDownloadButton
                        productId={p.id}
                        downloadUrl={p.freeDownloadUrl}
                        licenseRequired={
                          p.licenseMode === "REQUIRED"
                        }
                      />
                    ) : (
                      <div className="rounded-xl border border-line bg-surface px-4 py-3 text-center text-sm text-slate-500">
                        Free download is not available
                        yet.
                      </div>
                    )}

                    <WishlistButton
                      productId={p.id}
                    />
                  </>
                ) : (
                  <>
                    <BuyNow productId={p.id} />

                    <AddToCart
                      productId={p.id}
                    />

                    <WishlistButton
                      productId={p.id}
                    />
                  </>
                )}
              </div>

              <div className="mt-6 grid gap-2 border-t border-line pt-5 text-xs text-slate-500">
                <div>
                  ✓ Secure digital delivery
                </div>

                <div>
                  ✓ {licenseLabel}
                </div>

                <div>
                  ✓ Product updates supported
                </div>

                <div>
                  ✓ Verified purchase reviews
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white">
            Reviews
          </h2>

          <div className="mt-5 grid gap-4">
            {p.reviews.length ? (
              p.reviews.map((r) => (
                <div
                  className="card p-5"
                  key={r.id}
                >
                  <div className="flex justify-between">
                    <b className="text-white">
                      {r.user.username}
                    </b>

                    <span className="text-amber-300">
                      {"★".repeat(r.rating)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {r.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="card p-8 text-slate-500">
                No reviews yet.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}