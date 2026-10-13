import crypto from 'crypto';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { assertSameOrigin } from '@/lib/security/request';
import { handle, ok, ApiError } from '@/lib/utils/api';

function sha256(value: string) {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

function randomToken(bytes = 32) {
  return crypto
    .randomBytes(bytes)
    .toString('hex');
}

export const POST = handle(async (req: Request) => {
  assertSameOrigin(req);

  const user = await getCurrentUser();

  if (!user) {
    throw new ApiError(
      'UNAUTHORIZED',
      'Login required',
      401,
    );
  }

  let body: {
    fileId?: string;
    productId?: string;
  };

  try {
    body = await req.json();
  } catch {
    throw new ApiError(
      'UNAUTHORIZED',
      'Invalid JSON body',
      400,
    );
  }

  const fileId = String(body.fileId || '').trim();
  const productId = String(body.productId || '').trim();

  if (!fileId) {
    throw new ApiError(
      'UNAUTHORIZED',
      'File ID is required',
      400,
    );
  }

  const file = await prisma.productFile.findUnique({
    where: {
      id: fileId,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          licenseMode: true,
        },
      },
    },
  });

  if (!file) {
    throw new ApiError(
      'NOT_FOUND',
      'File not found',
      404,
    );
  }

  if (productId && file.productId !== productId) {
    throw new ApiError(
      'FORBIDDEN',
      'Invalid product file',
      403,
    );
  }

  const purchase = await prisma.orderItem.findFirst({
    where: {
      productId: file.productId,
      order: {
        userId: user.id,
        status: 'COMPLETED',
      },
    },
    select: {
      orderId: true,
      order: {
        select: {
          orderNumber: true,
        },
      },
    },
    orderBy: {
      order: {
        createdAt: 'desc',
      },
    },
  });

  if (!purchase) {
    throw new ApiError(
      'FORBIDDEN',
      'You do not own this product',
      403,
    );
  }

  let licenseId: string | null = null;

  const license = await prisma.license.findFirst({
    where: {
      productId: file.productId,
      userId: user.id,
      status: 'ACTIVE',
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
    },
  });

  /*
   * REQUIRED
   * Produk wajib memiliki license aktif.
   */
  if (file.product.licenseMode === 'REQUIRED') {
    if (!license) {
      throw new ApiError(
        'FORBIDDEN',
        'An active license is required to download this product',
        403,
      );
    }

    licenseId = license.id;
  }

  /*
   * OPTIONAL dan NONE
   * Tidak wajib memiliki license.
   *
   * Jika user sudah memiliki license aktif,
   * license tersebut tetap digunakan untuk pencatatan
   * download.
   */
  if (file.product.licenseMode !== 'REQUIRED') {
    licenseId = license?.id ?? null;
  }

  const token = randomToken(32);

  await prisma.downloadToken.create({
    data: {
      tokenHash: sha256(token),
      licenseId,
      userId: user.id,
      fileId: file.id,
      expiresAt: new Date(
        Date.now() + 10 * 60 * 1000,
      ),
      maxUses: 3,
    },
  });

  return ok({
    url: `/api/download/${token}`,
    productId: file.product.id,
    productName: file.product.name,
    orderId: purchase.orderId,
    orderNumber: purchase.order.orderNumber,
    expiresIn: 600,
  });
});