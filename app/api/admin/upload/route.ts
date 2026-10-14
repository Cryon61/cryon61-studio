import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

import { requireRole } from "@/lib/auth/session";
import { ApiError, handle, ok } from "@/lib/utils/api";
import { assertSameOrigin } from "@/lib/security/request";

const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);

  await requireRole("ADMIN");

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "File gambar wajib dipilih.",
      422,
    );
  }

  const extension = ALLOWED_TYPES.get(file.type);

  if (!extension) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Format gambar harus PNG, JPG, atau WEBP.",
      422,
    );
  }

  if (file.size <= 0) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "File gambar kosong.",
      422,
    );
  }

  if (file.size > MAX_SIZE) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Ukuran gambar maksimal 5 MB.",
      422,
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${randomUUID()}.${extension}`;

  const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "uploads",
    "products",
  );

  await mkdir(uploadDirectory, {
    recursive: true,
  });

  const filePath = path.join(
    uploadDirectory,
    filename,
  );

  await writeFile(filePath, buffer);

  const url =
    `/uploads/products/${filename}`;

  return ok({
    url,
    filename,
    size: file.size,
    type: file.type,
  });
});