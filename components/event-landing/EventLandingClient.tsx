"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { getPublicEvent } from "@/lib/public-event-client";
import { useAuthStore } from "@/store/auth-store";

import EventLandingPage from "./EventLandingPage";

interface EventLandingClientProps {
  username: string;
  eventSlug: string;
}

/**
 * Fetches event with optional auth (token from store) so owner/master see any approval state.
 * Renders EventLandingPage with approval sticky when pending/rejected.
 */
const EventLandingClient = ({
  username,
  eventSlug,
}: EventLandingClientProps) => {
  const token = useAuthStore((s) => s.token);

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["public-event", username, eventSlug, token ?? "anon"],
    queryFn: () => getPublicEvent(username, eventSlug, token),
  });

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading event…</p>
      </div>
    );
  }

  if (isError && error?.message === "Event not found") {
    notFound();
  }

  if (isError || !event) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <p className="text-destructive text-sm">Failed to load event.</p>
      </div>
    );
  }

  if (!event.isActive) {
    notFound();
  }

  return <EventLandingPage event={event} />;
};

export default EventLandingClient;
