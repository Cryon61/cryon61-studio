"use client";

import { useState } from "react";

export function ProductAdminForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    categoryId: categories[0]?.id || "",
    thumbnailUrl: "",
    features: "",
    requirements: "",
    robloxCompat: "",
    discountPercent: "0",
    licenseType: "PERSONAL",
    licenseMode: "NONE" as "NONE" | "REQUIRED" | "OPTIONAL",
    sourceMode: "CLOSED_SOURCE" as
      | "CLOSED_SOURCE"
      | "OPEN_SOURCE",
    featured: false,
  });

  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  function update(
    field: keyof typeof form,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const name = form.name.trim();
    const slug = form.slug.trim();
    const description = form.description.trim();

    const price = Number(form.price);
    const discountPercent = Number(form.discountPercent);

    // Description TIDAK wajib.
    if (!name || !slug) {
      setMsg("Name dan slug wajib diisi.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setMsg("Harga tidak valid.");
      return;
    }

    if (
      !Number.isFinite(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      setMsg("Discount harus antara 0 sampai 100%.");
      return;
    }

    setSaving(true);
    setMsg("Saving...");

    try {
      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            name,
            slug,
            description,

            price,
            discountPercent,

            categoryIds: form.categoryId
              ? [form.categoryId]
              : [],

            thumbnailUrl:
              form.thumbnailUrl.trim(),

            freeDownloadUrl: "",

            externalDownloadUrl: "",

            features: form.features
              .split("\n")
              .map((item) => item.trim())
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

      const result =
        await response.json().catch(() => ({}));

      if (!response.ok) {
        setMsg(
          result.error?.message ||
            result.message ||
            "Failed to create product.",
        );
        return;
      }

      setMsg(
        "Product created successfully.",
      );

      setForm({
        name: "",
        slug: "",
        description: "",
        price: "",
        categoryId:
          categories[0]?.id || "",
        thumbnailUrl: "",
        features: "",
        requirements: "",
        robloxCompat: "",
        discountPercent: "0",
        licenseType: "PERSONAL",
        licenseMode: "NONE",
        sourceMode: "CLOSED_SOURCE",
        featured: false,
      });
    } catch {
      setMsg(
        "Failed to create product.",
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
        Create product
      </h2>

      <input
        className="input"
        placeholder="Name"
        value={form.name}
        onChange={(e) =>
          update("name", e.target.value)
        }
        required
      />

      <input
        className="input"
        placeholder="slug"
        value={form.slug}
        onChange={(e) =>
          update("slug", e.target.value)
        }
        required
      />

      <input
        className="input"
        placeholder="Price IDR"
        type="number"
        min="0"
        value={form.price}
        onChange={(e) =>
          update("price", e.target.value)
        }
      />

      <input
        className="input"
        placeholder="Discount %"
        type="number"
        min="0"
        max="100"
        value={form.discountPercent}
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
        {categories.map((category) => (
          <option
            key={category.id}
            value={category.id}
          >
            {category.name}
          </option>
        ))}
      </select>

      <input
        className="input"
        placeholder="Thumbnail URL"
        value={form.thumbnailUrl}
        onChange={(e) =>
          update(
            "thumbnailUrl",
            e.target.value,
          )
        }
      />

      <textarea
        className="input min-h-28 md:col-span-2"
        placeholder="Description"
        value={form.description}
        onChange={(e) =>
          update(
            "description",
            e.target.value,
          )
        }
      />

      <textarea
        className="input min-h-24"
        placeholder="Features, one per line"
        value={form.features}
        onChange={(e) =>
          update(
            "features",
            e.target.value,
          )
        }
      />

      <textarea
        className="input min-h-24"
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

      <select
        className="input"
        value={form.licenseType}
        onChange={(e) =>
          update(
            "licenseType",
            e.target.value,
          )
        }
      >
        <option value="PERSONAL">
          Personal License
        </option>

        <option value="COMMERCIAL">
          Commercial License
        </option>

        <option value="UNLIMITED">
          Unlimited License
        </option>
      </select>

      <select
        className="input"
        value={form.licenseMode}
        onChange={(e) =>
          update(
            "licenseMode",
            e.target.value as
              | "NONE"
              | "REQUIRED"
              | "OPTIONAL",
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
            e.target.value as
              | "CLOSED_SOURCE"
              | "OPEN_SOURCE",
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

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:col-span-2">
        <div className="mb-3 text-sm font-semibold text-white">
          Distribution Settings
        </div>

        <div className="grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
          <div>
            <span className="text-slate-500">
              License
            </span>

            <div className="mt-1 font-medium text-white">
              {form.licenseMode === "NONE"
                ? "No License"
                : form.licenseMode === "REQUIRED"
                  ? "License Required"
                  : "License Optional"}
            </div>
          </div>

          <div>
            <span className="text-slate-500">
              Source
            </span>

            <div className="mt-1 font-medium text-white">
              {form.sourceMode === "OPEN_SOURCE"
                ? "Open Source"
                : "Closed Source"}
            </div>
          </div>

          <div>
            <span className="text-slate-500">
              License Type
            </span>

            <div className="mt-1 font-medium text-white">
              {form.licenseType}
            </div>
          </div>
        </div>
      </div>

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

        Featured
      </label>

      <button
        type="submit"
        disabled={saving}
        className="btn-primary md:col-span-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving
          ? "Creating..."
          : "Create product"}
      </button>

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