"use client";

import { useState } from "react";
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
    description: product.description,
    price: String(product.price),
    discountPercent: String(product.discountPercent),
    categoryId: product.categoryId || categories[0]?.id || "",
    thumbnailUrl: product.thumbnailUrl,
    features: product.features.join("\n"),
    requirements: product.requirements,
    robloxCompat: product.robloxCompat,

    licenseType: product.licenseType,
    licenseMode: product.licenseMode,
    sourceMode: product.sourceMode,

    featured: product.featured,
  });

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field: string, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setMsg("Saving changes...");

    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,

          name: form.name,
          slug: form.slug,
          description: form.description,

          price: Number(form.price),
          discountPercent: Number(form.discountPercent),

          categoryId: form.categoryId,

          thumbnailUrl: form.thumbnailUrl,

          features: form.features
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),

          requirements: form.requirements,
          robloxCompat: form.robloxCompat,

          licenseType: form.licenseType,
          licenseMode: form.licenseMode,
          sourceMode: form.sourceMode,

          featured: form.featured,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMsg(
          data.error?.message ||
            "Failed to update product."
        );

        return;
      }

      setMsg("Product updated successfully.");

      setTimeout(() => {
        router.push("/admin/products");
        router.refresh();
      }, 500);
    } catch {
      setMsg("Something went wrong.");
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
          update("name", e.target.value)
        }
        required
      />

      <input
        className="input"
        placeholder="Slug"
        value={form.slug}
        onChange={(e) =>
          update("slug", e.target.value)
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
          update("price", e.target.value)
        }
        required
      />

      <input
        className="input"
        type="number"
        min="0"
        max="100"
        placeholder="Discount %"
        value={form.discountPercent}
        onChange={(e) =>
          update(
            "discountPercent",
            e.target.value
          )
        }
      />

      <select
        className="input"
        value={form.categoryId}
        onChange={(e) =>
          update(
            "categoryId",
            e.target.value
          )
        }
        required
      >
        <option value="">
          Select category
        </option>

        {categories.map((category) => (
          <option
            key={category.id}
            value={category.id}
          >
            {category.name}
          </option>
        ))}
      </select>

      <select
        className="input"
        value={form.licenseType}
        onChange={(e) =>
          update(
            "licenseType",
            e.target.value as Product["licenseType"]
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
            e.target.value as Product["licenseMode"]
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
            e.target.value as Product["sourceMode"]
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

      <input
        className="input md:col-span-2"
        placeholder="Thumbnail URL"
        value={form.thumbnailUrl}
        onChange={(e) =>
          update(
            "thumbnailUrl",
            e.target.value
          )
        }
      />

      <textarea
        className="input min-h-32 md:col-span-2"
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          update(
            "description",
            e.target.value
          )
        }
        required
      />

      <textarea
        className="input min-h-28"
        placeholder="Features — one per line"
        value={form.features}
        onChange={(e) =>
          update(
            "features",
            e.target.value
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
            e.target.value
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
            e.target.value
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
              e.target.checked
            )
          }
        />

        Featured product
      </label>

      <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-semibold text-white">
          Distribution Settings
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Atur apakah produk membutuhkan license dan
          apakah source code tersedia untuk pembeli.
        </p>

        <div className="mt-3 grid gap-2 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-300">
              License:
            </span>{" "}
            {form.licenseMode === "NONE"
              ? "Tidak membutuhkan license"
              : form.licenseMode === "REQUIRED"
              ? "License wajib"
              : "License optional"}
          </div>

          <div>
            <span className="font-semibold text-slate-300">
              Source:
            </span>{" "}
            {form.sourceMode === "OPEN_SOURCE"
              ? "Source code terbuka"
              : "Source code tertutup"}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 md:col-span-2">
        <button
          type="submit"
          className="btn-primary"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>

        <button
          type="button"
          className="btn-ghost"
          onClick={() =>
            router.push("/admin/products")
          }
          disabled={saving}
        >
          Cancel
        </button>
      </div>

      {msg && (
        <p className="text-sm text-slate-400 md:col-span-2">
          {msg}
        </p>
      )}
    </form>
  );
}