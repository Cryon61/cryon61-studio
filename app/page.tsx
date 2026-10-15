import Link from "next/link";
import { prisma } from "@/lib/database/prisma";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import HeroBanner from "@/components/home/HeroBanner";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, best, categories, banners] =
    await Promise.all([
      prisma.product.findMany({
        where: {
          status: "PUBLISHED",
          featured: true,
        },
        include: {
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
        },
        take: 4,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.product.findMany({
        where: {
          status: "PUBLISHED",
        },
        include: {
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
        },
        take: 4,
        orderBy: {
          salesCount: "desc",
        },
      }),

      prisma.category.findMany({
        orderBy: {
          sortOrder: "asc",
        },
        take: 12,
      }),

      prisma.heroBanner.findMany({
        where: {
          active: true,
        },
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      }),
    ]);

  return (
    <>
      <Navbar />

      <main>
        {/* HERO BANNER */}
        <HeroBanner banners={banners} />

        {/* FEATURED PRODUCTS */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-soft">
                DISCOVER
              </p>

              <h2 className="mt-1 text-3xl font-bold text-white">
                Featured products
              </h2>
            </div>

            <Link
              href="/marketplace?featured=1"
              className="text-sm text-slate-400"
            >
              View all →
            </Link>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
              />
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="border-y border-line bg-surface/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="text-3xl font-bold text-white">
              Shop by category
            </h2>

            <div className="mt-7 flex flex-wrap gap-3">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/marketplace?category=${c.slug}`}
                  className="rounded-xl border border-line bg-card px-4 py-3 text-sm text-slate-300 hover:border-brand/50 hover:text-white"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* BEST SELLERS */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-soft">
                POPULAR
              </p>

              <h2 className="mt-1 text-3xl font-bold text-white">
                Best sellers
              </h2>
            </div>

            <Link
              href="/marketplace?sort=best"
              className="text-sm text-slate-400"
            >
              View all →
            </Link>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {best.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
              />
            ))}
          </div>
        </section>

        {/* SELLER CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/15 to-transparent p-8 sm:p-12">
            <h2 className="text-3xl font-bold text-white">
              Create something people want.
            </h2>

            <p className="mt-3 max-w-2xl text-slate-400">
              Publish your Roblox systems, maps, UI kits and other
              digital assets through CRYON61 STUDIO.
            </p>

            <Link
              href="/sell"
              className="btn-primary mt-6"
            >
              Become a seller
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}