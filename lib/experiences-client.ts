import axios from "axios";
import type { CreateEventPayload } from "@/types";
import { getApiBaseUrl } from "./api-client";

/** Server returns { statusCode, data, message, success }. */
interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  success: boolean;
}

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
  pricing: { price: number; currency: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create event. Token required (caller passes it so lib stays pure).
 * Use with useMutation: mutationFn: (payload) => createEvent(payload, getToken())
 */
export async function createEvent(
  payload: CreateEventPayload,
  token: string
): Promise<EventResponse> {
  const base = getApiBaseUrl();

  const { data } = await axios.post<ApiResponse<EventResponse>>(
    `${base}/admin/experiences`,
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
