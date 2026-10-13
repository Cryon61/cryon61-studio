import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/database/prisma";
import { Navbar } from "@/components/site/Navbar";
import { ProductAdminForm } from "@/components/admin/ProductAdminForm";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  try {
    await requireRole("ADMIN");
  } catch {
    redirect("/dashboard");
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.category.findMany({
      orderBy: {
        sortOrder: "asc",
      },
    }),
  ]);

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white">
              Product management
            </h1>

            <p className="mt-2 text-slate-400">
              Manage your CRYON61 STUDIO products.
            </p>
          </div>

          <a
            href="/admin"
            className="btn-ghost !py-2"
          >
            ← Admin Dashboard
          </a>
        </div>

        <div className="mt-8">
          <ProductAdminForm
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
            }))}
          />
        </div>

        <div className="card mt-8 overflow-hidden">
          <div className="border-b border-line p-5 font-bold text-white">
            Catalog
          </div>

          <div className="divide-y divide-line">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="min-w-0">
                  <b className="text-white">
                    {product.name}
                  </b>

                  <p className="mt-1 text-xs text-slate-500">
                    {product.slug} • {product.status}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    IDR{" "}
                    {product.price.toLocaleString("id-ID")}
                    {product.discountPercent > 0 && (
                      <>
                        {" "}
                        • {product.discountPercent}% discount
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/admin/products/${product.id}/edit`}
                    className="btn-primary !py-2"
                  >
                    Edit
                  </a>

                  <form
                    action="/api/admin/products/status"
                    method="post"
                    className="flex gap-2"
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={product.id}
                    />

                    <select
                      name="status"
                      defaultValue={product.status}
                      className="input !w-auto !py-2"
                    >
                      <option value="DRAFT">
                        DRAFT
                      </option>

                      <option value="PENDING">
                        PENDING
                      </option>

                      <option value="PUBLISHED">
                        PUBLISHED
                      </option>

                      <option value="ARCHIVED">
                        ARCHIVED
                      </option>
                    </select>

                    <button
                      type="submit"
                      className="btn-ghost !py-2"
                    >
                      Save
                    </button>
                  </form>
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No products found.
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}