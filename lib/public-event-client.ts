import { getApiBaseUrl } from "./api-client";
import type { PublicEvent } from "@/types";

export interface PublicEventApiResponse {
  success: boolean;
  data: PublicEvent;
  message?: string;
}

/**
 * Fetch a single public event by host username and event slug.
 * No auth required. Used for the event landing page.
 */
export async function getPublicEvent(
  username: string,
  eventSlug: string
): Promise<PublicEvent> {
  const base = getApiBaseUrl();

  const res = await fetch(
    `${base}/hosts/${encodeURIComponent(username)}/events/${encodeURIComponent(eventSlug)}`
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Event not found");
    }

    throw new Error("Failed to load event");
  }

  const json: PublicEventApiResponse = await res.json();

  if (!json.success || !json.data) {
    throw new Error("Invalid response");
  }

  return json.data;
}
