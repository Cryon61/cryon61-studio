import { z } from "zod";

import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";
import { ApiError, handle, ok } from "@/lib/utils/api";
import { assertSameOrigin } from "@/lib/security/request";

const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().min(1),
  features: z.array(z.string()).default([]),
  requirements: z.string().optional().or(z.literal("")),
  price: z.number().int().min(0),
  discountPercent: z.number().int().min(0).max(100).default(0),
  currency: z.string().min(1).max(10).default("IDR"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  licenseType: z
    .enum(["PERSONAL", "COMMERCIAL", "UNLIMITED"])
    .default("PERSONAL"),
  licenseMode: z
    .enum(["NONE", "REQUIRED", "OPTIONAL"])
    .default("NONE"),
  sourceMode: z
    .enum(["CLOSED_SOURCE", "OPEN_SOURCE"])
    .default("CLOSED_SOURCE"),
  freeDownloadUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  externalDownloadUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  allowRepurchase: z.boolean().default(false),
  robloxCompat: z.string().optional().or(z.literal("")),
  thumbnailUrl: z.string().optional().or(z.literal("")),
  categoryIds: z.array(z.string()).default([]),
});

async function requireAdmin() {
  return requireRole("ADMIN");
}

export const GET = handle(async () => {
  await requireAdmin();

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      categories: true,
    },
  });

  return ok(products);
});

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);

  const user = await requireAdmin();
  const body = await req.json();

  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    console.error(
      "[PRODUCT API] Validation errors:",
      parsed.error.flatten(),
    );

    throw new ApiError(
      "VALIDATION_ERROR",
      "Invalid product data",
      422,
    );
  }

  const b = parsed.data;

  const existing = await prisma.product.findUnique({
    where: {
      slug: b.slug,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    throw new ApiError(
      "CONFLICT",
      "Product slug already exists",
      409,
    );
  }

  const product = await prisma.product.create({
    data: {
      name: b.name,
      slug: b.slug,
      description: b.description,
      features: b.features,
      requirements: b.requirements || null,
      price: b.price,
      discountPercent: b.discountPercent,
      currency: b.currency,
      status: b.status,
      featured: b.featured,
      licenseType: b.licenseType,
      licenseMode: b.licenseMode,
      sourceMode: b.sourceMode,
      freeDownloadUrl: b.freeDownloadUrl || null,
      externalDownloadUrl: b.externalDownloadUrl || null,
      allowRepurchase: b.allowRepurchase,
      robloxCompat: b.robloxCompat || null,
      thumbnailUrl: b.thumbnailUrl || null,
      sellerId: user.id,
    },
    include: {
      categories: true,
    },
  });

  if (b.categoryIds.length > 0) {
    await prisma.productCategory.createMany({
      data: b.categoryIds.map((categoryId) => ({
        productId: product.id,
        categoryId,
      })),
      skipDuplicates: true,
    });
  }

  const result = await prisma.product.findUnique({
    where: {
      id: product.id,
    },
    include: {
      categories: true,
    },
  });

  return ok(result);
});

export const PATCH = handle(async (req: Request) => {
  assertSameOrigin(req);

  await requireAdmin();

  const body = await req.json();

  const id =
    typeof body?.id === "string"
      ? body.id.trim()
      : "";

  if (!id) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Product id required",
      422,
    );
  }

  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    console.error(
      "[PRODUCT API] Validation errors:",
      parsed.error.flatten(),
    );

    throw new ApiError(
      "VALIDATION_ERROR",
      "Invalid product data",
      422,
    );
  }

  const b = parsed.data;

  const existing = await prisma.product.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new ApiError(
      "NOT_FOUND",
      "Product not found",
      404,
    );
  }

  const slugOwner = await prisma.product.findFirst({
    where: {
      slug: b.slug,
      NOT: {
        id,
      },
    },
    select: {
      id: true,
    },
  });

  if (slugOwner) {
    throw new ApiError(
      "CONFLICT",
      "Product slug already exists",
      409,
    );
  }

  await prisma.product.update({
    where: {
      id,
    },
    data: {
      name: b.name,
      slug: b.slug,
      description: b.description,
      features: b.features,
      requirements: b.requirements || null,
      price: b.price,
      discountPercent: b.discountPercent,
      currency: b.currency,
      status: b.status,
      featured: b.featured,
      licenseType: b.licenseType,
      licenseMode: b.licenseMode,
      sourceMode: b.sourceMode,
      freeDownloadUrl: b.freeDownloadUrl || null,
      externalDownloadUrl: b.externalDownloadUrl || null,
      allowRepurchase: b.allowRepurchase,
      robloxCompat: b.robloxCompat || null,
      thumbnailUrl: b.thumbnailUrl || null,
    },
  });

  await prisma.productCategory.deleteMany({
    where: {
      productId: id,
    },
  });

  if (b.categoryIds.length > 0) {
    await prisma.productCategory.createMany({
      data: b.categoryIds.map((categoryId) => ({
        productId: id,
        categoryId,
      })),
      skipDuplicates: true,
    });
  }

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      categories: true,
    },
  });

  return ok(product);
});

export const DELETE = handle(async (req: Request) => {
  assertSameOrigin(req);

  await requireAdmin();

  const { searchParams } = new URL(req.url);

  const id = searchParams.get("id")?.trim();

  if (!id) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Product id required",
      422,
    );
  }

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    throw new ApiError(
      "NOT_FOUND",
      "Product not found",
      404,
    );
  }

  await prisma.product.delete({
    where: {
      id,
    },
  });

  return ok({
    deleted: true,
  });
});