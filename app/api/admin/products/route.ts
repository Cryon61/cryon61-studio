import { z } from "zod";
import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";
import { ApiError, handle, ok } from "@/lib/utils/api";
import { assertSameOrigin } from "@/lib/security/request";

const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  price: z.number().int().nonnegative(),
  discountPercent: z.number().int().min(0).max(100).default(0),
  categoryId: z.string(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  features: z.array(z.string()).default([]),
  requirements: z.string().optional(),
  robloxCompat: z.string().optional(),
  licenseType: z
    .enum(["PERSONAL", "COMMERCIAL", "UNLIMITED"])
    .default("PERSONAL"),
  featured: z.boolean().default(false),
});

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);

  const u = await requireRole("ADMIN");
  const b = productSchema.parse(await req.json());

  const p = await prisma.product.create({
    data: {
      name: b.name,
      slug: b.slug,
      description: b.description,
      price: b.price,
      discountPercent: b.discountPercent,
      thumbnailUrl: b.thumbnailUrl || null,
      features: b.features,
      requirements: b.requirements,
      robloxCompat: b.robloxCompat,
      licenseType: b.licenseType,
      featured: b.featured,
      status: "DRAFT",

      categories: {
        create: {
          categoryId: b.categoryId,
        },
      },

      versions: {
        create: {
          version: "1.0.0",
          isLatest: true,
          changelog: "Initial release",
        },
      },
    },
  });

  await prisma.adminLog.create({
    data: {
      adminId: u.id,
      action: "PRODUCT_CREATE",
      target: p.id,
    },
  });

  return ok(p, { status: 201 });
});

export const PATCH = handle(async (req: Request) => {
  assertSameOrigin(req);

  const u = await requireRole("ADMIN");

  const body = await req.json();
  const id = String(body.id || "");

  if (!id) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Product ID is required",
      400
    );
  }

  const b = productSchema.parse(body);

  const existing = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new ApiError(
      "NOT_FOUND",
      "Product not found",
      404
    );
  }

  const slugOwner = await prisma.product.findUnique({
    where: {
      slug: b.slug,
    },
  });

  if (slugOwner && slugOwner.id !== id) {
    throw new ApiError(
      "CONFLICT",
      "Another product already uses this slug",
      409
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.productCategory.deleteMany({
      where: {
        productId: id,
      },
    });

    const product = await tx.product.update({
      where: {
        id,
      },

      data: {
        name: b.name,
        slug: b.slug,
        description: b.description,
        price: b.price,
        discountPercent: b.discountPercent,
        thumbnailUrl: b.thumbnailUrl || null,
        features: b.features,
        requirements: b.requirements,
        robloxCompat: b.robloxCompat,
        licenseType: b.licenseType,
        featured: b.featured,

        categories: {
          create: {
            categoryId: b.categoryId,
          },
        },
      },
    });

    await tx.adminLog.create({
      data: {
        adminId: u.id,
        action: "PRODUCT_UPDATE",
        target: id,
      },
    });

    return product;
  });

  return ok(updated);
});