import path from 'path';
import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

import { prisma } from '@/lib/database/prisma';
import { getCurrentUser } from '@/lib/auth/session';

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function GET(
  req: Request,
  { params }: { params: { token: string } },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  const tokenHash = sha256(params.token);

  const downloadToken = await prisma.downloadToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      license: true,
    },
  });

  if (
    !downloadToken ||
    downloadToken.userId !== user.id ||
    downloadToken.expiresAt < new Date() ||
    downloadToken.usedCount >= downloadToken.maxUses
  ) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 403 },
    );
  }

  const file = await prisma.productFile.findUnique({
    where: {
      id: downloadToken.fileId,
    },
  });

  if (!file) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 },
    );
  }

  const storageRoot =
    process.env.PRIVATE_STORAGE_PATH ||
    path.join(process.cwd(), 'storage/private');

  const resolvedRoot = path.resolve(storageRoot);
  const safePath = path.resolve(
    storageRoot,
    file.storageKey,
  );

  if (
    !safePath.startsWith(
      resolvedRoot + path.sep,
    )
  ) {
    return NextResponse.json(
      { error: 'Invalid storage key' },
      { status: 400 },
    );
  }

  try {
    const data = await readFile(safePath);

    await prisma.downloadToken.update({
      where: {
        id: downloadToken.id,
      },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    /*
     * Download.licenseId masih wajib di schema.
     *
     * Untuk produk REQUIRED:
     * gunakan license dari token.
     *
     * Untuk NONE/OPTIONAL:
     * tidak boleh membuat Download dengan licenseId null.
     *
     * Karena schema Download saat ini masih membutuhkan licenseId,
     * pencatatan Download hanya dilakukan ketika token memiliki license.
     */
    if (downloadToken.licenseId) {
      await prisma.download.create({
        data: {
          userId: user.id,
          fileId: file.id,
          licenseId: downloadToken.licenseId,
          ip:
            req.headers
              .get('x-forwarded-for')
              ?.split(',')[0]
              ?.trim() || undefined,
          userAgent:
            req.headers.get('user-agent') || undefined,
        },
      });
    }

    return new NextResponse(data, {
      headers: {
        'Content-Type':
          file.mimeType ||
          'application/octet-stream',

        'Content-Disposition':
          `attachment; filename="${file.fileName.replace(/"/g, '')}"`,

        'Cache-Control':
          'private, no-store',
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          'Private file is unavailable on this server',
      },
      { status: 404 },
    );
  }
}