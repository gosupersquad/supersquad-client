import { getPublicEvent } from "@/lib/public-event-client";
import EventLandingClient from "@/components/event-landing/EventLandingClient";

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

  return <EventLandingClient username={username} eventSlug={eventSlug} />;
};

export default EventPage;
