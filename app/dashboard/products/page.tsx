import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/database/prisma';
import { Navbar } from '@/components/site/Navbar';
import MyProductsClient from '@/components/dashboard/MyProductsClient';

export const dynamic = 'force-dynamic';

export default async function MyProductsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
      status: 'COMPLETED',
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              files: {
                orderBy: {
                  createdAt: 'desc',
                },
              },
              versions: {
                orderBy: {
                  createdAt: 'desc',
                },
                include: {
                  files: {
                    orderBy: {
                      createdAt: 'desc',
                    },
                  },
                },
              },
            },
          },
        },
      },
      licenses: {
        where: {
          status: 'ACTIVE',
        },
        include: {
          product: true,
        },
      },
    },
  });

  const productMap = new Map<
    string,
    {
      product: (typeof orders)[number]['items'][number]['product'];
      orderId: string;
      orderNumber: string;
      purchasedAt: Date;
      license: (typeof orders)[number]['licenses'][number] | null;
    }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = productMap.get(item.productId);

      if (existing) {
        continue;
      }

      const license =
        order.licenses.find(
          (itemLicense) =>
            itemLicense.productId === item.productId,
        ) ?? null;

      productMap.set(item.productId, {
        product: item.product,
        orderId: order.id,
        orderNumber: order.orderNumber,
        purchasedAt: order.createdAt,
        license,
      });
    }
  }

  const products = Array.from(productMap.values()).map(
    ({
      product,
      orderId,
      orderNumber,
      purchasedAt,
      license,
    }) => ({
      product,
      orderId,
      orderNumber,
      purchasedAt: purchasedAt.toISOString(),
      license,
    }),
  );

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8">
          <p className="text-sm font-medium text-purple-300">
            CRYON61 STUDIO
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            My Products
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Semua produk yang sudah kamu beli dan tersedia untuk digunakan.
          </p>
        </div>

        <MyProductsClient products={products} />
      </main>
    </>
  );
}