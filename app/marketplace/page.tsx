import { prisma } from '@/lib/database/prisma';
import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';
import { ProductCard } from '@/components/shop/ProductCard';
import HeroBanner from '@/components/home/HeroBanner';

export const dynamic = 'force-dynamic';

export default async function Marketplace({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const q = searchParams.q?.trim();
  const cat = searchParams.category;
  const sort = searchParams.sort;
  const featured = searchParams.featured;

  const page = Math.max(1, Number(searchParams.page || 1));
  const take = 12;

  const where: any = {
    status: 'PUBLISHED',
  };

  if (q) {
    where.OR = [
      {
        name: {
          contains: q,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: q,
          mode: 'insensitive',
        },
      },
    ];
  }

  if (cat) {
    where.categories = {
      some: {
        category: {
          slug: cat,
        },
      },
    };
  }

  if (featured) {
    where.featured = true;
  }

  let orderBy: any = {
    createdAt: 'desc',
  };

  if (sort === 'best') {
    orderBy = { salesCount: 'desc' };
  }

  if (sort === 'rating') {
    orderBy = { ratingAvg: 'desc' };
  }

  if (sort === 'price-low') {
    orderBy = { price: 'asc' };
  }

  if (sort === 'price-high') {
    orderBy = { price: 'desc' };
  }

  const [products, total, categories, banners] = await Promise.all([
    prisma.product.findMany({
      where,
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
      orderBy,
      skip: (page - 1) * take,
      take,
    }),

    prisma.product.count({ where }),

    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    }),

    prisma.heroBanner.findMany({
      where: { active: true },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / take));

  return (
    <>
      <Navbar />

      <main>
        <HeroBanner banners={banners} />

        <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
          <div>
            <p className="text-sm font-semibold text-brand-soft">
              MARKETPLACE
            </p>

            <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
              Roblox assets for creators.
            </h1>

            <p className="mt-3 text-sm text-slate-500 sm:text-base">
              Systems, maps, scripts, UI, VFX and more.
            </p>
          </div>

          <form className="mt-6 grid gap-3 md:mt-8 md:grid-cols-[1fr_220px_180px]">
            <input
              name="q"
              defaultValue={q}
              className="input"
              placeholder="Search products..."
            />

            <select
              name="category"
              defaultValue={cat || ''}
              className="input"
            >
              <option value="">All categories</option>

              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={sort || ''}
              className="input"
            >
              <option value="">Newest</option>
              <option value="best">Best selling</option>
              <option value="rating">Highest rated</option>
              <option value="price-low">Price low</option>
              <option value="price-high">Price high</option>
            </select>

            {featured && (
              <input type="hidden" name="featured" value={featured} />
            )}

            <button className="btn-primary md:col-span-3">
              Search
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-slate-500 sm:mt-8 sm:text-sm">
            <span>{total} products</span>
            <span>Page {page} / {pages}</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {!products.length && (
            <div className="card mt-5 p-8 text-center text-sm text-slate-500 sm:p-12">
              No products found.
            </div>
          )}

          <div className="mt-8 flex justify-center gap-2">
            {page > 1 && (
              <a
                className="btn-ghost"
                href={`?q=${encodeURIComponent(q || '')}&category=${encodeURIComponent(cat || '')}&sort=${encodeURIComponent(sort || '')}&featured=${encodeURIComponent(featured || '')}&page=${page - 1}`}
              >
                Previous
              </a>
            )}

            {page < pages && (
              <a
                className="btn-ghost"
                href={`?q=${encodeURIComponent(q || '')}&category=${encodeURIComponent(cat || '')}&sort=${encodeURIComponent(sort || '')}&featured=${encodeURIComponent(featured || '')}&page=${page + 1}`}
              >
                Next
              </a>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}