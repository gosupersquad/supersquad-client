"use client";

import { format, parseISO } from "date-fns";
import type { MediaItem } from "@/types";

function getFirstImageUrl(media: MediaItem[]): string | null {
  const first = media?.find((m) => m.type === "image");
  return first?.url ?? null;
}

interface CheckoutHeroProps {
  media: MediaItem[];
  location: string;
  startDate: string;
  dateDisplayText?: string;
}

const CheckoutHero = ({
  media,
  location,
  startDate,
  dateDisplayText,
}: CheckoutHeroProps) => {
  const imageUrl = getFirstImageUrl(media);

  let dateMonth: string | null = null;
  let dateDay: string | null = null;
  if (dateDisplayText?.trim()) {
    const parts = dateDisplayText.trim().split(/\s+/);
    dateMonth = parts[0]?.toUpperCase() ?? null;
    dateDay = parts[1] ?? null;
  } else if (startDate) {
    try {
      const d = parseISO(startDate.slice(0, 10));
      dateMonth = format(d, "MMM").toUpperCase();
      dateDay = format(d, "d");
    } catch {
      dateMonth = null;
      dateDay = null;
    }
  }

  return (
    <div className="bg-muted relative aspect-16/10 w-full overflow-hidden md:mt-6 md:h-[60vh] md:rounded-2xl">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="hero image"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
          No image
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4">
        <span className="text-lg font-semibold text-white drop-shadow-md md:text-xl">
          {location}
        </span>

        {dateMonth && dateDay && (
          <div className="bg-background/90 flex flex-col items-center rounded-lg px-3 py-1.5">
            <span className="text-muted-foreground text-xs font-medium">
              {dateMonth}
            </span>

            <span className="text-foreground text-lg font-bold">{dateDay}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutHero;
