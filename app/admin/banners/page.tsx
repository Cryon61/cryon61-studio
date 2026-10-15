"use client";

import { useEffect, useState } from "react";

type Banner = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  active: boolean;
};

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  buttonText: "",
  buttonLink: "",
  sortOrder: "0",
  active: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadBanners() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/banners", {
        credentials: "same-origin",
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Gagal mengambil banner."
        );
      }

      setBanners(data?.banners || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil banner."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBanners();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setMessage("");
  }

  function editBanner(banner: Banner) {
    setEditingId(banner.id);

    setForm({
      title: banner.title,
      description: banner.description || "",
      imageUrl: banner.imageUrl,
      buttonText: banner.buttonText || "",
      buttonLink: banner.buttonLink || "",
      sortOrder: String(banner.sortOrder),
      active: banner.active,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveBanner(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
      };

      const response = await fetch("/api/admin/banners", {
        method: editingId ? "PATCH" : "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(
          editingId
            ? {
                id: editingId,
                ...payload,
              }
            : payload
        ),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Gagal menyimpan banner."
        );
      }

      setMessage(
        editingId
          ? "Banner berhasil diperbarui."
          : "Banner berhasil ditambahkan."
      );

      resetForm();
      await loadBanners();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan banner."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleBanner(banner: Banner) {
    setError("");

    try {
      const response = await fetch("/api/admin/banners", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: banner.id,
          active: !banner.active,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Gagal mengubah status banner."
        );
      }

      await loadBanners();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengubah status banner."
      );
    }
  }

  async function deleteBanner(banner: Banner) {
    const confirmed = window.confirm(
      `Hapus banner "${banner.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `/api/admin/banners?id=${encodeURIComponent(banner.id)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Gagal menghapus banner."
        );
      }

      if (editingId === banner.id) {
        resetForm();
      }

      await loadBanners();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus banner."
      );
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">
          Hero Banners
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Kelola banyak banner homepage. Banner aktif akan
          ditampilkan sebagai slideshow otomatis.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {message}
        </div>
      )}

      <form
        onSubmit={saveBanner}
        className="card mb-10 p-5 sm:p-6"
      >
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {editingId
                ? "Edit Hero Banner"
                : "Tambah Hero Banner"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Kamu bisa membuat banner sebanyak yang kamu mau.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="btn-ghost"
            >
              Batal Edit
            </button>
          )}
        </div>

        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Judul
            </label>

            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              className="input w-full"
              placeholder="Contoh: Fishing System V3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Deskripsi
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="input min-h-28 w-full"
              placeholder="Deskripsi singkat banner..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              URL Gambar
            </label>

            <input
              required
              type="url"
              value={form.imageUrl}
              onChange={(e) =>
                setForm({
                  ...form,
                  imageUrl: e.target.value,
                })
              }
              className="input w-full"
              placeholder="https://..."
            />

            {form.imageUrl && (
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                <img
                  src={form.imageUrl}
                  alt="Preview banner"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Teks Tombol
              </label>

              <input
                value={form.buttonText}
                onChange={(e) =>
                  setForm({
                    ...form,
                    buttonText: e.target.value,
                  })
                }
                className="input w-full"
                placeholder="Lihat Produk"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Link Tombol
              </label>

              <input
                value={form.buttonLink}
                onChange={(e) =>
                  setForm({
                    ...form,
                    buttonLink: e.target.value,
                  })
                }
                className="input w-full"
                placeholder="/marketplace"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Urutan
              </label>

              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sortOrder: e.target.value,
                  })
                }
                className="input w-full"
                min="0"
              />
            </div>

            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-4">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    active: e.target.checked,
                  })
                }
              />

              <span className="text-sm text-white">
                Banner aktif
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full sm:w-fit"
          >
            {saving
              ? "Menyimpan..."
              : editingId
                ? "Simpan Perubahan"
                : "Tambah Banner"}
          </button>
        </div>
      </form>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Daftar Banner
          </h2>

          <span className="text-sm text-slate-500">
            {banners.length} banner
          </span>
        </div>

        {loading ? (
          <div className="card p-8 text-center text-slate-500">
            Memuat banner...
          </div>
        ) : banners.length === 0 ? (
          <div className="card p-8 text-center text-slate-500">
            Belum ada banner.
          </div>
        ) : (
          <div className="grid gap-5">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="card overflow-hidden"
              >
                <div className="grid lg:grid-cols-[280px_1fr]">
                  <div className="aspect-video bg-black/30 lg:aspect-auto">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-full min-h-48 w-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-white">
                            {banner.title}
                          </h3>

                          <span
                            className={
                              banner.active
                                ? "rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400"
                                : "rounded-full bg-slate-500/10 px-2 py-1 text-xs text-slate-500"
                            }
                          >
                            {banner.active
                              ? "Aktif"
                              : "Nonaktif"}
                          </span>
                        </div>

                        {banner.description && (
                          <p className="mt-2 text-sm text-slate-500">
                            {banner.description}
                          </p>
                        )}
                      </div>

                      <span className="rounded-lg bg-white/5 px-3 py-1 text-xs text-slate-400">
                        Order: {banner.sortOrder}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editBanner(banner)}
                        className="btn-ghost"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleBanner(banner)}
                        className="btn-ghost"
                      >
                        {banner.active
                          ? "Nonaktifkan"
                          : "Aktifkan"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteBanner(banner)}
                        className="btn-ghost !text-red-400"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}