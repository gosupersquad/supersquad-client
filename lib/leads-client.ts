import axios from "axios";
import type { ApiResponse } from "@/types";
import { getApiBaseUrl } from "./api-client";

/** Event list item for leads dashboard cards. */
export interface EventLeadsListItem {
  id: string;
  slug: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  media: { url: string; type: "image" | "video" }[];
  spotsAvailable: number;
  createdAt: string;
  updatedAt: string;
}

/** Single attendee in a booking. */
export interface LeadsAttendee {
  ticketCode: string;
  name: string;
  email: string;
  phone: string;
  instagram?: string;
}

/** Single booking in leads detail. */
export interface LeadsBooking {
  id: string;
  ticketBreakdown: { code: string; quantity: number; unitPrice: number }[];
  attendees: LeadsAttendee[];
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

/** Event leads detail: event + stats + bookings. */
export interface EventLeadsDetail {
  id: string;
  slug: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  media: { url: string; type: "image" | "video" }[];
  spotsAvailable: number;
  totalSpots: number;
  spotsBooked: number;
  amountCollected: number;
  createdAt: string;
  updatedAt: string;
  bookings: LeadsBooking[];
}

const EXPERIENCES_BASE = () => `${getApiBaseUrl()}/admin/experiences`;

/**
 * List events for leads dashboard (cards). Token required.
 * GET /api/v1/admin/experiences?format=leads&type=event
 */
export async function listLeads(
  token: string,
  type: "event" | "trip" = "event"
): Promise<EventLeadsListItem[]> {
  const { data } = await axios.get<ApiResponse<EventLeadsListItem[]>>(
    EXPERIENCES_BASE(),
    {
      params: { format: "leads", type },
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!Array.isArray(data.data)) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}

/**
 * Get one event's leads detail (stats + bookings). Token required.
 * GET /api/v1/admin/experiences/:id/leads?type=event
 */
export async function getLeadsDetail(
  id: string,
  token: string,
  type: "event" | "trip" = "event"
): Promise<EventLeadsDetail> {
  const { data } = await axios.get<ApiResponse<EventLeadsDetail>>(
    `${EXPERIENCES_BASE()}/${id}/leads`,
    {
      params: { type },
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!data.data) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}
