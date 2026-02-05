import { notFound } from "next/navigation";

import { getPublicEvent } from "@/lib/public-event-client";
import EventLandingPage from "@/components/event-landing/EventLandingPage";
import { PublicEvent } from "@/types";

type Props = {
  params: Promise<{ username: string; eventSlug: string }>;
};

export const generateMetadata = async ({ params }: Props) => {
  const { username, eventSlug } = await params;

  try {
    const event = await getPublicEvent(username, eventSlug);

    if (!event?.isActive) return { title: "Event not found" };

    return {
      title: event.title,
      description: event.description?.slice(0, 160) ?? undefined,
    };
  } catch {
    return { title: "Event not found" };
  }
};

const EventPage = async ({ params }: Props) => {
  const { username, eventSlug } = await params;
  let event: PublicEvent;

  try {
    event = await getPublicEvent(username, eventSlug);
  } catch {
    notFound();
  }

  if (!event?.isActive) {
    notFound();
  }

  return <EventLandingPage event={event} />;
};

export default EventPage;
