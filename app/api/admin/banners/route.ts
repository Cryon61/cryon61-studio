import { prisma } from "@/lib/database/prisma";
import { requireRole } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  try {
    await requireRole("ADMIN");
  } catch {
    await requireRole("OWNER");
  }
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      message,
    },
    { status }
  );
}

export async function GET() {
  try {
    await requireAdmin();

    const banners = await prisma.heroBanner.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      ok: true,
      banners,
    });
  } catch {
    return errorResponse("Tidak memiliki akses.", 403);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    const title = String(body.title ?? "").trim();
    const description =
      body.description == null
        ? null
        : String(body.description).trim() || null;

    const imageUrl = String(body.imageUrl ?? "").trim();

    const buttonText =
      body.buttonText == null
        ? null
        : String(body.buttonText).trim() || null;

    const buttonLink =
      body.buttonLink == null
        ? null
        : String(body.buttonLink).trim() || null;

    const sortOrder = Number.isFinite(Number(body.sortOrder))
      ? Number(body.sortOrder)
      : 0;

    const active =
      typeof body.active === "boolean"
        ? body.active
        : true;

    if (!title) {
      return errorResponse("Title wajib diisi.", 422);
    }

    if (!imageUrl) {
      return errorResponse("Image URL wajib diisi.", 422);
    }

    const banner = await prisma.heroBanner.create({
      data: {
        title,
        description,
        imageUrl,
        buttonText,
        buttonLink,
        sortOrder,
        active,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        banner,
      },
      { status: 201 }
    );
  } catch {
    return errorResponse("Gagal membuat banner.", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    const id = String(body.id ?? "").trim();

    if (!id) {
      return errorResponse("Banner id wajib diisi.", 422);
    }

    const existing = await prisma.heroBanner.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse("Banner tidak ditemukan.", 404);
    }

    const data: {
      title?: string;
      description?: string | null;
      imageUrl?: string;
      buttonText?: string | null;
      buttonLink?: string | null;
      sortOrder?: number;
      active?: boolean;
    } = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim();

      if (!title) {
        return errorResponse("Title wajib diisi.", 422);
      }

      data.title = title;
    }

    if (body.description !== undefined) {
      data.description =
        body.description == null
          ? null
          : String(body.description).trim() || null;
    }

    if (body.imageUrl !== undefined) {
      const imageUrl = String(body.imageUrl).trim();

      if (!imageUrl) {
        return errorResponse("Image URL wajib diisi.", 422);
      }

      data.imageUrl = imageUrl;
    }

    if (body.buttonText !== undefined) {
      data.buttonText =
        body.buttonText == null
          ? null
          : String(body.buttonText).trim() || null;
    }

    if (body.buttonLink !== undefined) {
      data.buttonLink =
        body.buttonLink == null
          ? null
          : String(body.buttonLink).trim() || null;
    }

    if (body.sortOrder !== undefined) {
      const sortOrder = Number(body.sortOrder);

      if (!Number.isFinite(sortOrder)) {
        return errorResponse(
          "Sort order tidak valid.",
          422
        );
      }

      data.sortOrder = sortOrder;
    }

    if (body.active !== undefined) {
      if (typeof body.active !== "boolean") {
        return errorResponse(
          "Active harus berupa boolean.",
          422
        );
      }

      data.active = body.active;
    }

    const banner = await prisma.heroBanner.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ok: true,
      banner,
    });
  } catch {
    return errorResponse(
      "Gagal memperbarui banner.",
      500
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return errorResponse("Banner id wajib diisi.", 422);
    }

    const existing = await prisma.heroBanner.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return errorResponse(
        "Banner tidak ditemukan.",
        404
      );
    }

    await prisma.heroBanner.delete({
      where: { id },
    });

    return NextResponse.json({
      ok: true,
      deleted: true,
    });
  } catch {
    return errorResponse(
      "Gagal menghapus banner.",
      500
    );
  }
}