"use client";

import Link from "next/link";
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

export default function HeroBanner({
  banners,
}: {
  banners: Banner[];
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrent((value) => (value + 1) % banners.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (current >= banners.length) {
      setCurrent(0);
    }
  }, [current, banners.length]);

  if (!banners.length) {
    return null;
  }

  const banner = banners[current];

  if (!banner) {
    return null;
  }

  function previousBanner() {
    setCurrent(
      (value) => (value - 1 + banners.length) % banners.length,
    );
  }

  function nextBanner() {
    setCurrent(
      (value) => (value + 1) % banners.length,
    );
  }

  const hasContent =
    Boolean(banner.title?.trim()) ||
    Boolean(banner.description?.trim()) ||
    Boolean(
      banner.buttonText?.trim() &&
        banner.buttonLink?.trim(),
    );

  return (
    <section className="border-b border-line bg-background">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:py-8">
        <div className="overflow-hidden rounded-xl border border-line bg-card sm:rounded-2xl">
          {/* BANNER IMAGE */}
          <div className="relative">
            <div className="relative h-[110px] w-full overflow-hidden bg-black sm:h-[180px] md:h-[220px] lg:h-[260px]">
              <img
                key={banner.id}
                src={banner.imageUrl}
                alt={banner.title?.trim() || "Hero banner"}
                loading="eager"
                className="h-full w-full object-contain sm:object-cover"
              />
            </div>

            {/* PREVIOUS / NEXT */}
            {banners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previousBanner}
                  aria-label="Banner sebelumnya"
                  className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl text-white sm:left-3 sm:h-10 sm:w-10"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={nextBanner}
                  aria-label="Banner berikutnya"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 text-xl text-white sm:right-3 sm:h-10 sm:w-10"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* OPTIONAL TEXT AND BUTTON */}
          {hasContent && (
            <div className="px-4 py-4 sm:px-7 sm:py-6">
              {banner.title?.trim() && (
                <h2 className="break-words text-xl font-black tracking-tight text-white sm:text-3xl">
                  {banner.title}
                </h2>
              )}

              {banner.description?.trim() && (
                <p className="mt-2 break-words text-sm leading-5 text-slate-400 sm:mt-3 sm:text-base sm:leading-7">
                  {banner.description}
                </p>
              )}

              {banner.buttonText?.trim() &&
                banner.buttonLink?.trim() && (
                  <div className="mt-4">
                    <Link
                      href={banner.buttonLink}
                      className="btn-primary inline-flex max-w-full items-center justify-center break-words px-4 py-2 text-sm sm:px-5 sm:py-3"
                    >
                      {banner.buttonText}
                    </Link>
                  </div>
                )}
            </div>
          )}

          {/* SLIDE DOTS */}
          {banners.length > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-line px-3 py-3">
              {banners.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrent(index)}
                  aria-label={`Pilih banner ${index + 1}`}
                  aria-current={
                    index === current ? "true" : undefined
                  }
                  className={`h-2 rounded-full transition-all ${
                    index === current
                      ? "w-6 bg-brand"
                      : "w-2 bg-slate-600 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}