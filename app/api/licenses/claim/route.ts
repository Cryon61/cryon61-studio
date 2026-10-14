import crypto from "crypto";
import { prisma } from "@/lib/database/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ApiError, handle, ok } from "@/lib/utils/api";
import {
  assertSameOrigin,
  enforceRateLimit,
} from "@/lib/security/request";

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);
  enforceRateLimit(req, "license-claim", 10, 60000);

  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError(
      "UNAUTHORIZED",
      "Login required",
      401,
    );
  }

  const body = await req.json();

  const productId =
    typeof body?.productId === "string"
      ? body.productId.trim()
      : "";

  if (!productId) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "productId required",
      422,
    );
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      status: true,
      price: true,
      discountPercent: true,
      licenseMode: true,
      freeDownloadUrl: true,
    },
  });

  if (!product || product.status !== "PUBLISHED") {
    throw new ApiError(
      "NOT_FOUND",
      "Product not found",
      404,
    );
  }

  const finalPrice = Math.round(
    (product.price *
      (100 - product.discountPercent)) /
      100,
  );

  if (finalPrice > 0) {
    throw new ApiError(
      "CONFLICT",
      "This product is not free",
      409,
    );
  }

  if (product.licenseMode !== "REQUIRED") {
    throw new ApiError(
      "CONFLICT",
      "This product does not require a license",
      409,
    );
  }

  if (!product.freeDownloadUrl) {
    throw new ApiError(
      "CONFLICT",
      "Free download is not configured",
      409,
    );
  }

  const existingLicense =
    await prisma.license.findFirst({
      where: {
        productId: product.id,
        userId: user.id,
        status: "ACTIVE",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (existingLicense) {
    return ok({
      claimed: false,
      alreadyOwned: true,
      licenseId: existingLicense.id,
      licenseKey: existingLicense.key,
      downloadUrl: product.freeDownloadUrl,
    });
  }

  const licenseKey =
    `CRYON61-${product.id
      .slice(-6)
      .toUpperCase()}-` +
    `${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}-` +
    `${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

  const license =
    await prisma.license.create({
      data: {
        key: licenseKey,
        productId: product.id,
        userId: user.id,
      },
    });

  return ok({
    claimed: true,
    alreadyOwned: false,
    licenseId: license.id,
    licenseKey: license.key,
    downloadUrl: product.freeDownloadUrl,
  });
});