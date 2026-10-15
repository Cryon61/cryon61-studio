"use client";

import { useState } from "react";

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setShowConfirm(false);
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/products?id=${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
          credentials: "same-origin",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Gagal menghapus produk."
        );
      }

      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus produk."
      );
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className="btn-ghost !py-2 !text-red-400 opacity-50"
      >
        Deleting...
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setShowConfirm(true);
        }}
        className="btn-ghost !py-2 !text-red-400 hover:!text-red-300"
      >
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">
              Hapus produk?
            </h3>

            <p className="mt-2 break-words text-sm text-zinc-300">
              Apakah kamu yakin ingin menghapus{" "}
              <span className="font-semibold text-white">
                "{productName}"
              </span>
              ?
            </p>

            <p className="mt-2 text-xs text-red-400">
              Produk yang sudah dihapus tidak dapat dikembalikan.
            </p>

            {error && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="min-h-11 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="min-h-11 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Hapus Produk
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}