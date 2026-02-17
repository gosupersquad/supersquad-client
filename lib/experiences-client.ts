import axios from "axios";
import type {
  ApiResponse,
  CreateEventPayload,
  EventQuestion,
  EventTicket,
  UpdateEventPayload,
} from "@/types";
import { getApiBaseUrl } from "./api-client";

export interface EventResponse {
  _id: string;
  hostId: string;
  title: string;
  slug: string;
  location: string;
  description: string;
  spotsAvailable: number;
  startDate: string;
  endDate: string;
  dateDisplayText?: string;
  media: { url: string; type: "image" | "video" }[];
  faqs: { question: string; answer: string }[];
  tickets: EventTicket[];
  customQuestions?: EventQuestion[];
  isFreeRsvp?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const EXPERIENCES_BASE = () => `${getApiBaseUrl()}/admin/experiences`;

/**
 * List current host's events. Token required.
 * Use with useQuery: queryFn: () => listEvents(getToken())
 */
export async function listEvents(token: string): Promise<EventResponse[]> {
  const { data } = await axios.get<ApiResponse<EventResponse[]>>(
    EXPERIENCES_BASE(),
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!Array.isArray(data.data)) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}

/**
 * Toggle event active status. Token required.
 * Use with useMutation; onSuccess invalidate experiences query.
 */
export async function toggleEventStatus(
  id: string,
  token: string
): Promise<EventResponse> {
  const { data } = await axios.put<ApiResponse<EventResponse>>(
    `${EXPERIENCES_BASE()}/${id}/toggle-status`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!data.data) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}

/**
 * Get one event by id. Token required.
 */
export const getEvent = async (
  id: string,
  token: string
): Promise<EventResponse> => {
  const { data } = await axios.get<ApiResponse<EventResponse>>(
    `${EXPERIENCES_BASE()}/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!data.data) {
    throw new Error("Invalid response from server");
  }
  return data.data;
}

/**
 * Update event. Token required. Payload is partial (only sent fields are updated).
 */
export async function updateEvent(
  id: string,
  payload: UpdateEventPayload,
  token: string
): Promise<EventResponse> {
  const { data } = await axios.put<ApiResponse<EventResponse>>(
    `${EXPERIENCES_BASE()}/${id}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!data.data) {
    throw new Error("Invalid response from server");
  }
  return data.data;
}

/**
 * Create event. Token required (caller passes it so lib stays pure).
 * Use with useMutation: mutationFn: (payload) => createEvent(payload, getToken())
 */
export async function createEvent(
  payload: CreateEventPayload,
  token: string
): Promise<EventResponse> {
  try {
    const { data } = await axios.post<ApiResponse<EventResponse>>(
      EXPERIENCES_BASE(),
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!data.data) {
      throw new Error("Invalid response from server");
    }

    return data.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const body = err.response.data as { message?: string };

      if (typeof body.message === "string" && body.message) {
        throw new Error(body.message);
      }
    }

    throw err;
  }
}
