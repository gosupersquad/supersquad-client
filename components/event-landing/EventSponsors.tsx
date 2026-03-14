"use client";

import { useEffect, useRef, useState } from "react";

import { getDominantColor } from "@/lib/utils";
import type { PublicEvent } from "@/types";

interface EventSponsorsProps {
  sponsors: PublicEvent["sponsors"];
}

type DominantColor = { r: number; g: number; b: number; hex: string };

const EventSponsors = ({ sponsors }: EventSponsorsProps) => {
  const [colors, setColors] = useState<Record<string, DominantColor | null>>(
    {},
  );
  const startedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    sponsors?.forEach((sponsor) => {
      const key = sponsor.logo;
      if (!key || startedRef.current.has(key)) return;
      startedRef.current.add(key);

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const result = getDominantColor(img);
          if (result)
            setColors((prev) => ({
              ...prev,
              [key]: { r: result.r, g: result.g, b: result.b, hex: result.hex },
            }));
        } catch {
          setColors((prev) => ({ ...prev, [key]: null }));
        }
      };
      img.onerror = () => setColors((prev) => ({ ...prev, [key]: null }));
      img.src = key;
    });
  }, [sponsors]);

  if (!sponsors?.length) return null;

  const renderCard = (
    sponsor: (typeof sponsors)[number],
    isPrimary: boolean,
  ) => {
    const color = colors[sponsor.logo];
    const style =
      color != null
        ? {
            backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.35)`,
            borderColor: color.hex,
            borderWidth: 1,
            borderStyle: "solid" as const,
          }
        : undefined;

    const logoSizeClass = isPrimary ? "size-36" : "size-20 md:size-36";
    const textSizeClass = isPrimary
      ? "text-2xl font-bold"
      : "text-base font-semibold";

    return (
      <div
        key={sponsor.name}
        className={`flex w-full flex-col items-center gap-3 rounded-2xl border px-4 py-6 md:w-fit ${color == null ? "border-border bg-muted" : ""}`}
        style={style}
      >
        <div
          className={`relative shrink-0 overflow-hidden rounded-xl ${logoSizeClass}`}
        >
          {/* User-provided URL, any domain — use img instead of next/image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sponsor.logo}
            alt={sponsor.name}
            className="size-full object-contain"
          />
        </div>

        <span className={`text-foreground text-center ${textSizeClass}`}>
          {sponsor.name}
        </span>
      </div>
    );
  };

  const [first, ...rest] = sponsors;

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold">Sponsors</h2>

      {/* Mobile: first w-full, rest in grid-cols-2 (each card fills one cell); desktop: flex-wrap, all w-fit */}
      <div className="mt-4 flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-4">
        {first && (
          <div className="w-full md:w-fit">{renderCard(first, true)}</div>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:contents">
            {rest.map((sponsor) => (
              <div key={sponsor.name} className="min-w-0 md:contents">
                {renderCard(sponsor, false)}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventSponsors;
