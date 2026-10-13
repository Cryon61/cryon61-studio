import { redirect } from "next/navigation";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";
import { ProductEditForm } from "@/components/admin/ProductEditForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    await requireRole("ADMIN");
  } catch {
    redirect("/dashboard");
  }

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id: params.id,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    }),

    prisma.category.findMany({
      orderBy: {
        sortOrder: "asc",
      },
    }),
  ]);

  if (!product) {
    redirect("/admin/products");
  }

  const currentCategoryId =
    product.categories[0]?.categoryId ?? "";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <a
          href="/admin/products"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to Products
        </a>

        <h1 className="mt-4 text-4xl font-black text-white">
          Edit Product
        </h1>

        <p className="mt-2 text-slate-400">
          Update product information without changing its
          existing files, orders, licenses, or sales data.
        </p>
      </div>

      <ProductEditForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          discountPercent: product.discountPercent,
          thumbnailUrl: product.thumbnailUrl ?? "",
          features: product.features,
          requirements: product.requirements ?? "",
          robloxCompat: product.robloxCompat ?? "",

          licenseType: product.licenseType,
          licenseMode: product.licenseMode,
          sourceMode: product.sourceMode,

          featured: product.featured,
          categoryId: currentCategoryId,
        }}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
      />
    </main>
  );
}