"use client";

import { ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";

import EventCard from "@/components/host/EventCard";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EventResponse } from "@/lib/experiences-client";
import { toEventCardData } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

interface ExperiencesCardsProps {
  events: EventResponse[];
}

export default function ExperiencesCards({ events }: ExperiencesCardsProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="grid gap-4 sm:grid-cols-1">
      {events.map((event) => {
        const viewLiveHref =
          user?.username && event.slug
            ? `/hosts/${user.username}/events/${event.slug}`
            : null;

        const actions = (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 border-0 bg-black/70 text-white shadow-sm hover:bg-black/80"
                  asChild
                >
                  <Link href={`/host/experiences/${event._id}/edit?type=event`}>
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
          </>
        );

        return (
          <EventCard
            key={event._id}
            event={toEventCardData(event)}
            actions={actions}
            approvalStatus={event.approvalStatus}
            rejectedReason={event.rejectedReason}
          />
        );
      })}
    </div>
  );
}
