"use client";

import { useEffect, useRef, useState } from "react";

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
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          data?.message || "Gagal mengambil banner.",
        );
      }

      setBanners(data?.banners || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil banner.",
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

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function editBanner(banner: Banner) {
    setEditingId(banner.id);

    setForm({
      title: banner.title || "",
      description: banner.description || "",
      imageUrl: banner.imageUrl || "",
      buttonText: banner.buttonText || "",
      buttonLink: banner.buttonLink || "",
      sortOrder: String(banner.sortOrder ?? 0),
      active: banner.active,
    });

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    setMessage("");

    try {
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Format gambar harus PNG, JPG, atau WEBP.",
        );
      }

      if (file.size <= 0) {
        throw new Error("File gambar kosong.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error(
          "Ukuran gambar maksimal 5 MB.",
        );
      }

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            data?.data?.message ||
            "Gagal mengupload gambar.",
        );
      }

      const url = String(
        data?.url ||
          data?.data?.url ||
          data?.result?.url ||
          ""
      ).trim();

      if (!url) {
        throw new Error(
          "URL gambar dari server tidak ditemukan.",
        );
      }

      setForm((current) => ({
        ...current,
        imageUrl: url,
      }));

      setMessage("Gambar berhasil diupload.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengupload gambar.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadImage(file);
  }

  async function saveBanner(
    event: React.FormEvent,
  ) {
    event.preventDefault();

    // Hanya gambar yang wajib diisi.
    if (!form.imageUrl.trim()) {
      setError(
        "Silakan pilih dan upload gambar banner.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        title: form.title.trim(),
        description:
          form.description.trim() || null,
        imageUrl: form.imageUrl.trim(),
        buttonText:
          form.buttonText.trim() || null,
        buttonLink:
          form.buttonLink.trim() || null,
        sortOrder: Number(form.sortOrder) || 0,
        active: form.active,
      };

      const response = await fetch(
        "/api/admin/banners",
        {
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
              : payload,
          ),
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Gagal menyimpan banner.",
        );
      }

      setMessage(
        editingId
          ? "Banner berhasil diperbarui."
          : "Banner berhasil ditambahkan.",
      );

      resetForm();

      await loadBanners();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan banner.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleBanner(banner: Banner) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/banners",
        {
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
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Gagal mengubah status banner.",
        );
      }

      await loadBanners();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengubah status banner.",
      );
    }
  }

  async function deleteBanner(banner: Banner) {
    const confirmed = window.confirm(
      `Hapus banner "${banner.title || "Tanpa Judul"}"?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/banners?id=${encodeURIComponent(
          banner.id,
        )}`,
        {
          method: "DELETE",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Gagal menghapus banner.",
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
          : "Gagal menghapus banner.",
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
          Kelola banner homepage dengan upload gambar
          langsung dari perangkat.
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
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {editingId
                ? "Edit Hero Banner"
                : "Tambah Hero Banner"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Judul, deskripsi, dan tombol boleh
              dikosongkan.
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
              <span className="ml-2 text-xs font-normal text-slate-500">
                (Opsional)
              </span>
            </label>

            <input
              value={form.title}
              onChange={(event) =>
                setForm({
                  ...form,
                  title: event.target.value,
                })
              }
              className="input w-full"
              placeholder="Boleh dikosongkan"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Deskripsi
              <span className="ml-2 text-xs font-normal text-slate-500">
                (Opsional)
              </span>
            </label>

            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
              className="input min-h-28 w-full"
              placeholder="Boleh dikosongkan"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Gambar Banner
              <span className="ml-2 text-xs font-normal text-red-400">
                (Wajib)
              </span>
            </label>

            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                disabled={uploading}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="btn-primary w-full sm:w-fit"
              >
                {uploading
                  ? "Mengupload..."
                  : form.imageUrl
                    ? "Ganti Gambar"
                    : "Pilih Gambar"}
              </button>

              <p className="mt-2 text-xs text-slate-500">
                PNG, JPG, atau WEBP. Maksimal 5 MB.
              </p>

              {form.imageUrl && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-black/20">
                  <div className="aspect-[16/6] w-full">
                    <img
                      src={form.imageUrl}
                      alt="Preview banner"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Teks Tombol
                <span className="ml-2 text-xs font-normal text-slate-500">
                  (Opsional)
                </span>
              </label>

              <input
                value={form.buttonText}
                onChange={(event) =>
                  setForm({
                    ...form,
                    buttonText: event.target.value,
                  })
                }
                className="input w-full"
                placeholder="Boleh dikosongkan"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Link Tombol
                <span className="ml-2 text-xs font-normal text-slate-500">
                  (Opsional)
                </span>
              </label>

              <input
                value={form.buttonLink}
                onChange={(event) =>
                  setForm({
                    ...form,
                    buttonLink: event.target.value,
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
                min="0"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm({
                    ...form,
                    sortOrder: event.target.value,
                  })
                }
                className="input w-full"
              />
            </div>

            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-4">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  setForm({
                    ...form,
                    active: event.target.checked,
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
            disabled={saving || uploading}
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
                      alt={banner.title || "Banner"}
                      className="h-full min-h-48 w-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-white">
                            {banner.title ||
                              "Tanpa Judul"}
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

                    {(banner.buttonText ||
                      banner.buttonLink) && (
                      <div className="mt-3 text-xs text-slate-500">
                        Tombol:{" "}
                        {banner.buttonText ||
                          "Tanpa teks"}{" "}
                        →{" "}
                        {banner.buttonLink ||
                          "Tanpa link"}
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          editBanner(banner)
                        }
                        className="btn-ghost"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleBanner(banner)
                        }
                        className="btn-ghost"
                      >
                        {banner.active
                          ? "Nonaktifkan"
                          : "Aktifkan"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteBanner(banner)
                        }
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