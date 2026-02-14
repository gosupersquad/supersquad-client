"use client";

import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";

/** Minimal event shape shared by Experiences and Leads list. */
export interface EventCardData {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  media: { url: string; type: string }[];
  /** If provided, show "Sold out" overlay when 0. */
  spotsAvailable?: number;
}

interface EventCardProps {
  event: EventCardData;
  /** When set, the whole card is a link (e.g. leads → detail). */
  linkHref?: string;
  /** Optional actions (e.g. Edit + View live) rendered top-right. */
  actions?: React.ReactNode;
}

function getCardImageUrl(event: EventCardData): string | null {
  const image = event.media?.find((m) => m.type === "image");
  return image?.url ?? null;
}

const EventCard = ({ event, linkHref, actions }: EventCardProps) => {
  const startFormatted = event.startDate
    ? format(new Date(event.startDate), "d")
    : "";

  const endFormatted = event.endDate
    ? format(new Date(event.endDate), "d MMMM ''yy")
    : "";

  const datesText =
    startFormatted && endFormatted
      ? `${startFormatted} to ${endFormatted}`
      : "No dates";

  const imageUrl = getCardImageUrl(event);
  const isSoldOut =
    event.spotsAvailable !== undefined && event.spotsAvailable === 0;

  const content = (
    <div className="relative overflow-hidden rounded-xl">
      {imageUrl ? (
        <div
          className="bg-muted aspect-4/3 w-full rounded-t-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 rounded-t-xl bg-linear-to-t from-black/80 via-black/20 to-transparent" />

          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center rounded-t-xl bg-black/50">
              <span className="text-lg font-semibold tracking-wider text-white uppercase">
                Sold Out
              </span>
            </div>
          )}

          <div className="absolute right-0 bottom-0 left-0 p-4 text-white">
            <h3 className="truncate text-lg font-semibold">{event.title}</h3>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{event.location || "—"}</span>
              </span>

              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" />
                <span>{datesText}</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted relative aspect-4/3 w-full rounded-t-xl px-4 pt-12 pb-4">
          {isSoldOut && (
            <div className="absolute inset-0 flex items-center justify-center rounded-t-xl bg-black/50">
              <span className="text-lg font-semibold tracking-wider text-white uppercase">
                Sold Out
              </span>
            </div>
          )}
          <div className="flex h-full flex-col justify-end">
            <h3 className="truncate text-lg font-semibold">{event.title}</h3>

            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{event.location || "—"}</span>
              </span>

              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" />
                <span>{datesText}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {actions ? (
        <div className="absolute top-2 right-2 flex gap-1.5">{actions}</div>
      ) : null}
    </div>
  );

  if (linkHref) {
    return (
      <Link href={linkHref} className="block">
        {content}
      </Link>
    );
  }

  return content;
};

export default EventCard;
