import type { ApiResponse } from "@/types";
import type { PublicEvent } from "@/types";
import axios from "axios";

import { getApiBaseUrl } from "./api-client";

/**
 * Fetch a single public event by host username and event slug.
 * Optional token: when provided (e.g. host owner or master), backend returns event in any approval state.
 * When no token (public), backend returns only when approved and active; else 404.
 */
export async function getPublicEvent(
  username: string,
  eventSlug: string,
  token?: string | null,
): Promise<PublicEvent> {
  const base = getApiBaseUrl();
  const url = `${base}/hosts/${encodeURIComponent(username)}/events/${encodeURIComponent(eventSlug)}`;

  try {
    const { data } = await axios.get<ApiResponse<PublicEvent>>(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!data.data) {
      throw new Error("Invalid response");
    }

    return data.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      throw new Error("Event not found");
    }
    throw err;
  }
}
