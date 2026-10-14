"use client";

import { useState } from "react";

type Props = {
  productId: string;
  downloadUrl: string;
  licenseRequired: boolean;
};

export function FreeDownloadButton({
  productId,
  downloadUrl,
  licenseRequired,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (loading) return;

    setLoading(true);

    try {
      if (!licenseRequired) {
        window.location.href = downloadUrl;
        return;
      }

      const response = await fetch(
        "/api/licenses/claim",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            productId,
          }),
        },
      );

      const result = await response.json().catch(
        () => ({}),
      );

      if (response.status === 401) {
        window.location.href =
          `/login?next=${encodeURIComponent(
            window.location.pathname,
          )}`;

        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error?.message ||
            result.message ||
            result.error ||
            "Download gagal.",
        );
      }

      const url =
        result.data?.downloadUrl ||
        result.downloadUrl;

      if (!url) {
        throw new Error(
          "URL download tidak ditemukan.",
        );
      }

      window.location.href = url;
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Download gagal.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="btn-primary flex min-h-11 w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        "Processing..."
      ) : (
        <>
          Download Free
          <span className="ml-2">↗</span>
        </>
      )}
    </button>
  );
}