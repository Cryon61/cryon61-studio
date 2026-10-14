"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPercent: number;
  thumbnailUrl: string;
  freeDownloadUrl: string;
  externalDownloadUrl: string;
  features: string[];
  requirements: string;
  robloxCompat: string;
  licenseType: "PERSONAL" | "COMMERCIAL" | "UNLIMITED";
  licenseMode: "NONE" | "REQUIRED" | "OPTIONAL";
  sourceMode: "CLOSED_SOURCE" | "OPEN_SOURCE";
  featured: boolean;
  categoryId: string;
};

export function ProductEditForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    price: String(product.price),
    discountPercent: String(product.discountPercent),
    categoryId:
      product.categoryId || categories[0]?.id || "",
    thumbnailUrl: product.thumbnailUrl || "",
    freeDownloadUrl:
      product.freeDownloadUrl || "",
    externalDownloadUrl:
      product.externalDownloadUrl || "",
    features: product.features.join("\n"),
    requirements: product.requirements || "",
    robloxCompat: product.robloxCompat || "",
    licenseType: product.licenseType,
    licenseMode: product.licenseMode,
    sourceMode: product.sourceMode,
    featured: product.featured,
  });

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const [imagePreview, setImagePreview] =
    useState(product.thumbnailUrl || "");

  const [imageName, setImageName] =
    useState("");

  const [imageUploading, setImageUploading] =
    useState(false);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function update(
    field: string,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMsg("File harus berupa gambar.");
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMsg(
        "Format gambar harus PNG, JPG, atau WEBP.",
      );
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setMsg(
        "Ukuran gambar maksimal 5 MB.",
      );
      e.target.value = "";
      return;
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
    setImageName(file.name);
    setImageUploading(true);
    setMsg("Uploading image...");

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "/api/admin/upload",
        {
          method: "POST",
          credentials: "same-origin",
          body: formData,
        },
      );

      const data =
        await response.json().catch(
          () => ({}),
        );

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            data.message ||
            "Upload gambar gagal.",
        );
      }

      const uploadedUrl =
        data.data?.url ||
        data.url;

      if (!uploadedUrl) {
        throw new Error(
          "URL gambar tidak ditemukan.",
        );
      }

      update(
        "thumbnailUrl",
        uploadedUrl,
      );

      setImagePreview(uploadedUrl);
      setMsg(
        "Image uploaded successfully.",
      );
    } catch (error) {
      setMsg(
        error instanceof Error
          ? error.message
          : "Upload gambar gagal.",
      );
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  }

  function removeImage() {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview("");
    setImageName("");

    update(
      "thumbnailUrl",
      "",
    );

    setMsg("");
  }

  async function submit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (imageUploading) {
      setMsg(
        "Tunggu sampai upload gambar selesai.",
      );
      return;
    }

    const name = form.name.trim();
    const slug = form.slug.trim();
    const description =
      form.description.trim();

    if (!name || !slug) {
      setMsg(
        "Name dan slug wajib diisi.",
      );
      return;
    }

    const price = Number(form.price);
    const discountPercent =
      Number(form.discountPercent);

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      setMsg("Harga tidak valid.");
      return;
    }

    if (
      !Number.isFinite(
        discountPercent,
      ) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      setMsg(
        "Discount harus antara 0 sampai 100%.",
      );
      return;
    }

    setSaving(true);
    setMsg("Saving changes...");

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            id: product.id,

            name,
            slug,
            description,

            price,
            discountPercent,

            categoryIds:
              form.categoryId
                ? [form.categoryId]
                : [],

            thumbnailUrl:
              form.thumbnailUrl.trim(),

            freeDownloadUrl:
              form.freeDownloadUrl.trim(),

            externalDownloadUrl:
              form.externalDownloadUrl.trim(),

            features:
              form.features
                .split("\n")
                .map((item) =>
                  item.trim(),
                )
                .filter(Boolean),

            requirements:
              form.requirements.trim(),

            robloxCompat:
              form.robloxCompat.trim(),

            licenseType:
              form.licenseType,

            licenseMode:
              form.licenseMode,

            sourceMode:
              form.sourceMode,

            featured:
              form.featured,

            allowRepurchase: false,

            currency: "IDR",

            status: "PUBLISHED",
          }),
        },
      );

      const data =
        await response.json().catch(
          () => ({}),
        );

      if (!response.ok) {
        setMsg(
          data.error?.message ||
            data.message ||
            "Failed to update product.",
        );

        return;
      }

      setMsg(
        "Product updated successfully.",
      );

      setTimeout(() => {
        router.push(
          "/admin/products",
        );

        router.refresh();
      }, 500);
    } catch {
      setMsg(
        "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="card grid gap-4 p-6 md:grid-cols-2"
    >
      <h2 className="text-xl font-bold text-white md:col-span-2">
        Product Information
      </h2>

      <input
        className="input"
        placeholder="Product name"
        value={form.name}
        onChange={(e) =>
          update(
            "name",
            e.target.value,
          )
        }
        required
      />

      <input
        className="input"
        placeholder="Slug"
        value={form.slug}
        onChange={(e) =>
          update(
            "slug",
            e.target.value,
          )
        }
        required
      />

      <input
        className="input"
        type="number"
        min="0"
        placeholder="Price IDR"
        value={form.price}
        onChange={(e) =>
          update(
            "price",
            e.target.value,
          )
        }
        required
      />

      <input
        className="input"
        type="number"
        min="0"
        max="100"
        placeholder="Discount %"
        value={
          form.discountPercent
        }
        onChange={(e) =>
          update(
            "discountPercent",
            e.target.value,
          )
        }
      />

      <select
        className="input"
        value={form.categoryId}
        onChange={(e) =>
          update(
            "categoryId",
            e.target.value,
          )
        }
      >
        <option value="">
          Select category
        </option>

        {categories.map(
          (category) => (
            <option
              key={category.id}
              value={category.id}
            >
              {category.name}
            </option>
          ),
        )}
      </select>

      <select
        className="input"
        value={form.licenseType}
        onChange={(e) =>
          update(
            "licenseType",
            e.target.value as Product["licenseType"],
          )
        }
      >
        <option value="PERSONAL">
          Personal
        </option>

        <option value="COMMERCIAL">
          Commercial
        </option>

        <option value="UNLIMITED">
          Unlimited
        </option>
      </select>

      <select
        className="input"
        value={form.licenseMode}
        onChange={(e) =>
          update(
            "licenseMode",
            e.target.value as Product["licenseMode"],
          )
        }
      >
        <option value="NONE">
          No License
        </option>

        <option value="REQUIRED">
          License Required
        </option>

        <option value="OPTIONAL">
          License Optional
        </option>
      </select>

      <select
        className="input"
        value={form.sourceMode}
        onChange={(e) =>
          update(
            "sourceMode",
            e.target.value as Product["sourceMode"],
          )
        }
      >
        <option value="CLOSED_SOURCE">
          Closed Source
        </option>

        <option value="OPEN_SOURCE">
          Open Source
        </option>
      </select>

      {/* THUMBNAIL */}
      <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-semibold text-white">
          Product Thumbnail
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Pilih gambar dari Gallery di HP
          atau File Explorer di laptop.
          Maksimal 5 MB.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Product thumbnail preview"
                className="aspect-video h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-sm text-slate-600">
                No image
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-3">
            <label
              className={`btn-primary inline-flex min-h-11 items-center justify-center ${
                imageUploading ||
                saving
                  ? "pointer-events-none opacity-60"
                  : "cursor-pointer"
              }`}
            >
              {imageUploading
                ? "Uploading..."
                : "Choose Image"}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={
                  imageUploading ||
                  saving
                }
                onChange={
                  handleImageChange
                }
              />
            </label>

            {imageName && (
              <p className="break-all text-xs text-slate-400">
                Selected: {imageName}
              </p>
            )}

            {imagePreview && (
              <button
                type="button"
                className="btn-ghost min-h-11"
                onClick={
                  removeImage
                }
                disabled={
                  imageUploading ||
                  saving
                }
              >
                Remove Image
              </button>
            )}

            <p className="text-xs text-slate-600">
              PNG, JPG, JPEG atau WEBP.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-xs font-medium text-slate-300">
            Thumbnail URL
          </label>

          <input
            className="input w-full"
            placeholder="https://example.com/image.webp"
            value={form.thumbnailUrl}
            onChange={(e) => {
              update(
                "thumbnailUrl",
                e.target.value,
              );

              if (
                e.target.value.trim()
              ) {
                setImagePreview(
                  e.target.value,
                );
                setImageName("");
              } else {
                setImagePreview("");
                setImageName("");
              }
            }}
          />

          <p className="mt-1 text-xs text-slate-600">
            URL akan otomatis terisi setelah
            upload gambar berhasil.
          </p>
        </div>
      </div>

      {/* DESCRIPTION - OPTIONAL */}
      <textarea
        className="input min-h-32 md:col-span-2"
        placeholder="Description (optional)"
        value={form.description}
        onChange={(e) =>
          update(
            "description",
            e.target.value,
          )
        }
      />

      <textarea
        className="input min-h-28"
        placeholder="Features — one per line"
        value={form.features}
        onChange={(e) =>
          update(
            "features",
            e.target.value,
          )
        }
      />

      <textarea
        className="input min-h-28"
        placeholder="Requirements"
        value={form.requirements}
        onChange={(e) =>
          update(
            "requirements",
            e.target.value,
          )
        }
      />

      <input
        className="input"
        placeholder="Roblox compatibility"
        value={form.robloxCompat}
        onChange={(e) =>
          update(
            "robloxCompat",
            e.target.value,
          )
        }
      />

      <label className="flex items-center gap-2 text-sm text-slate-400">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(e) =>
            update(
              "featured",
              e.target.checked,
            )
          }
        />

        Featured product
      </label>

      {/* DELIVERY SETTINGS */}
      <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-semibold text-white">
          Delivery Settings
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Atur link download untuk produk
          gratis dan akses download untuk
          produk berbayar.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-300">
              Free Download Link
            </label>

            <input
              className="input w-full"
              type="url"
              placeholder="https://example.com/free-download"
              value={
                form.freeDownloadUrl
              }
              onChange={(e) =>
                update(
                  "freeDownloadUrl",
                  e.target.value,
                )
              }
            />

            <p className="mt-1 text-xs text-slate-500">
              Digunakan untuk produk
              gratis yang menyediakan
              download langsung.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-300">
              External Paid Download Link
            </label>

            <input
              className="input w-full"
              type="url"
              placeholder="https://example.com/paid-download"
              value={
                form.externalDownloadUrl
              }
              onChange={(e) =>
                update(
                  "externalDownloadUrl",
                  e.target.value,
                )
              }
            />

            <p className="mt-1 text-xs text-slate-500">
              Untuk produk berbayar yang
              file-nya disimpan di layanan
              eksternal.
            </p>
          </div>
        </div>
      </div>

      {/* DISTRIBUTION SETTINGS */}
      <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-semibold text-white">
          Distribution Settings
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Atur apakah produk membutuhkan
          license dan apakah source code
          tersedia untuk pembeli.
        </p>

        <div className="mt-3 grid gap-2 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-300">
              License:
            </span>{" "}
            {form.licenseMode ===
            "NONE"
              ? "Tidak membutuhkan license"
              : form.licenseMode ===
                "REQUIRED"
              ? "License wajib"
              : "License optional"}
          </div>

          <div>
            <span className="font-semibold text-slate-300">
              Source:
            </span>{" "}
            {form.sourceMode ===
            "OPEN_SOURCE"
              ? "Source code terbuka"
              : "Source code tertutup"}
          </div>

          <div>
            <span className="font-semibold text-slate-300">
              Free Download:
            </span>{" "}
            {form.freeDownloadUrl.trim()
              ? "Tersedia"
              : "Belum dikonfigurasi"}
          </div>

          <div>
            <span className="font-semibold text-slate-300">
              External Paid Download:
            </span>{" "}
            {form.externalDownloadUrl.trim()
              ? "Tersedia"
              : "Belum dikonfigurasi"}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-3 md:col-span-2">
        <button
          type="submit"
          className="btn-primary"
          disabled={
            saving ||
            imageUploading
          }
        >
          {saving
            ? "Saving..."
            : imageUploading
            ? "Uploading..."
            : "Save Changes"}
        </button>

        <button
          type="button"
          className="btn-ghost"
          onClick={() =>
            router.push(
              "/admin/products",
            )
          }
          disabled={
            saving ||
            imageUploading
          }
        >
          Cancel
        </button>
      </div>

      {msg && (
        <p
          className="text-sm text-slate-400 md:col-span-2"
          aria-live="polite"
        >
          {msg}
        </p>
      )}
    </form>
  );
}