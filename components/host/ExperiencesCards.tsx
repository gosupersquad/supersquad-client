"use client";

import { format } from "date-fns";
import { Calendar, ExternalLink, MapPin, Pencil } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EventResponse } from "@/lib/experiences-client";
import { useAuthStore } from "@/store/auth-store";

interface ExperiencesCardsProps {
  events: EventResponse[];
}

function getCardImageUrl(event: EventResponse): string | null {
  const image = event.media?.find((m) => m.type === "image");
  return image?.url ?? null;
}

const ExperiencesCards = ({ events }: ExperiencesCardsProps) => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="grid gap-4 sm:grid-cols-1">
      {events.map((event) => {
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
        const viewLiveHref =
          user?.username && event.slug
            ? `/hosts/${user.username}/events/${event.slug}`
            : null;

        return (
          <div key={event._id} className="relative overflow-hidden rounded-xl">
            {imageUrl ? (
              <div
                className="aspect-4/3 w-full rounded-t-xl bg-muted bg-cover bg-center"
                style={{ backgroundImage: `url(${imageUrl})` }}
              >
                <div className="absolute inset-0 rounded-t-xl bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="truncate text-lg font-semibold">
                    {event.title}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" />

                      <span className="truncate">{event.location}</span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 shrink-0" />
                      <span>{datesText}</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-muted aspect-4/3 w-full rounded-t-xl px-4 pb-4 pt-12">
                <div className="flex h-full flex-col justify-end">
                  <h3 className="truncate text-lg font-semibold">
                    {event.title}
                  </h3>

                  <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 shrink-0" />
                      <span>{datesText}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="absolute right-2 top-2 flex gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 border-0 bg-black/70 text-white shadow-sm hover:bg-black/80"
                    asChild
                  >
                    <Link
                      href={`/host/experiences/${event._id}/edit?type=event`}
                    >
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  <p>Edit event</p>
                </TooltipContent>
              </Tooltip>

              {viewLiveHref && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 border-0 bg-black/70 text-white shadow-sm hover:bg-black/80"
                      asChild
                    >
                      <Link
                        href={viewLiveHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>View live</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExperiencesCards;
