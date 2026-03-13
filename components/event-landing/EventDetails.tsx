"use client";

import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import Image from "next/image";
import { Separator } from "../ui/separator";

const EventDetails = ({
  location,
  startDate,
  endDate,
  description,
}: {
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}) => {
  // Single line for date + time, e.g. "Sat, Mar 14, 26 10:00 AM"
  let dateTimeLine = startDate;
  try {
    const start = new Date(startDate);
    dateTimeLine = format(start, "EEE, MMM d, ''yy");
    if (start.getHours() !== 0 || start.getMinutes() !== 0) {
      dateTimeLine += ` ${format(start, "h:mm a")}`;
      const end = new Date(endDate);
      if (end.getHours() !== 0 || end.getMinutes() !== 0) {
        dateTimeLine += ` – ${format(end, "h:mm a")}`;
      }
    }
  } catch {
    // keep dateTimeLine as is
  }

  const mapsSearchUrl =
    location &&
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        {/* Dates row: calendar icon + date/time */}
        <div className="flex items-center gap-3 text-base">
          <div className="bg-muted flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
            <CalendarDays className="text-foreground size-6" />
          </div>

          <p className="text-foreground text-sm">{dateTimeLine}</p>
        </div>

        {/* Location row: Google Maps icon + underlined link */}
        {location && (
          <div className="flex items-center gap-3 text-base">
            <div className="relative">
              <Image
                src="/icons/google-maps.svg"
                alt="google maps"
                width={44}
                height={44}
                className="size-11 object-contain"
              />

              {/* white dot, slightly bigger than black, and below black */}
              <div className="absolute top-1/2 left-1/2 z-20 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg shadow-black/50" />

              {/* black dot in center */}
              <div className="absolute top-1/2 left-1/2 z-30 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
            </div>

            {mapsSearchUrl ? (
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground text-sm underline hover:opacity-80"
              >
                {location}
              </a>
            ) : (
              <p className="text-foreground text-sm">{location}</p>
            )}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {description && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="leading-relaxed whitespace-pre-wrap text-white/75">
            {description}
          </p>
        </div>
      )}
    </section>
  );
};

export default EventDetails;
