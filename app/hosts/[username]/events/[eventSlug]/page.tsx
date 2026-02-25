import type { Metadata } from "next";

import { getPublicEvent } from "@/lib/public-event-client";
import EventLandingClient from "@/components/event-landing/EventLandingClient";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://backend.orside.com/api/v1";

type Props = {
  params: Promise<{ username: string; eventSlug: string }>;
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { username, eventSlug } = await params;

  try {
    const event = await getPublicEvent(username, eventSlug);

    if (!event?.isActive) return { title: "Event not found" };

    const images = event.media
      .filter((m) => m.type === "image")
      .map((m) => m.url);

    const description = event.description?.slice(0, 160).trim() || undefined;

    const canonicalUrl = `${BASE_URL}/hosts/${username}/events/${eventSlug}`;
    const hostName = event.hostId?.name ?? username;

    const openGraphImages =
      images.length > 0
        ? images.map((url) => ({
            url,
            width: 1200,
            height: 630,
            alt: event.title,
          }))
        : undefined;

    return {
      title: event.title,
      description,

      keywords: [
        event.title,
        event.location,
        hostName,
        "event",
        "experience",
        "Supersquad",
      ].filter(Boolean),

      authors: hostName ? [{ name: hostName }] : undefined,

      openGraph: {
        title: event.title,
        description: description ?? undefined,
        url: canonicalUrl,
        type: "website",
        siteName: "Supersquad",
        images: openGraphImages,
        locale: "en_IN",
      },

      twitter: {
        card: "summary_large_image",
        title: event.title,
        description: description ?? undefined,
        images: images.length > 0 ? [images[0]] : undefined,
      },

      alternates: {
        canonical: canonicalUrl,
      },

      robots: {
        index: true,
        follow: true,
      },
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
