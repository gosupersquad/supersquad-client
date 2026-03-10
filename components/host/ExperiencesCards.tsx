"use client";

import { BarChart3, Eye, Pencil } from "lucide-react";

import EventCard from "@/components/host/EventCard";
import type { EventResponse } from "@/lib/experiences-client";
import { toEventCardData } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

import FooterActionBtn from "./FooterActionBtn";

interface ExperiencesCardsProps {
  events: EventResponse[];
}

export default function ExperiencesCards({ events }: ExperiencesCardsProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="grid gap-4 sm:grid-cols-1">
      {events.map((event) => {
        const cardData = toEventCardData(event);
        const viewLiveHref =
          user?.username && event.slug
            ? `/hosts/${user.username}/events/${event.slug}`
            : null;

        const footerActions = (
          <>
            <FooterActionBtn
              href={`/host/leads/event/${cardData.id}`}
              icon={<BarChart3 className="size-4" />}
              // label="Analytics"
            />

            <FooterActionBtn
              href={`/host/experiences/${cardData.id}/edit?type=event`}
              icon={<Pencil className="size-4" />}
              // label="Edit"
            />

            {viewLiveHref ? (
              <FooterActionBtn
                href={viewLiveHref}
                icon={<Eye className="size-4" />}
                // label="View"
              />
            ) : null}
          </>
        );

        return (
          <EventCard
            key={event._id}
            event={cardData}
            footerActions={footerActions}
            approvalStatus={event.approvalStatus}
            rejectedReason={event.rejectedReason}
          />
        );
      })}
    </div>
  );
}
