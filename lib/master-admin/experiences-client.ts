import type { ApiResponse, MediaItem } from "@/types";
import type { EventResponse } from "../experiences-client";
import type { PublicEvent } from "@/types";
import { createMasterApi } from "./api";

export { isMasterForbidden } from "./api";

/** Slim list item for pending-approval cards and all-experiences list. */
export interface MasterEventListItem {
  id: string;
  title: string;
  slug: string;
  host: { name: string; username: string };
  approvalStatus: string;
  spotsAvailable: number;
  totalSpots: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  media: MediaItem[];
}

export interface SetApprovalPayload {
  approved: boolean;
  rejectedReason?: string;
}

/**
 * List experiences by approval status (e.g. pending). Master only.
 */
export async function listPendingExperiences(
  token: string,
  approvalStatus = "pending"
): Promise<MasterEventListItem[]> {
  const api = createMasterApi(token);
  const { data } = await api.get<ApiResponse<MasterEventListItem[]>>(
    "/experiences",
    { params: { approvalStatus } }
  );

  if (!Array.isArray(data.data)) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}

/**
 * List all experiences (all hosts, all approval statuses). Master only. For MAP "All experiences" page.
 */
export async function listAllExperiences(token: string): Promise<MasterEventListItem[]> {
  const api = createMasterApi(token);
  const { data } = await api.get<ApiResponse<MasterEventListItem[]>>(
    "/experiences",
    { params: { approvalStatus: "all" } }
  );

  if (!Array.isArray(data.data)) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}

/**
 * Count experiences by approval status (for badge). Master only.
 */
export async function getPendingCount(
  token: string,
  approvalStatus = "pending"
): Promise<number> {
  const api = createMasterApi(token);
  const { data } = await api.get<ApiResponse<{ count: number }>>(
    "/experiences/count",
    { params: { approvalStatus } }
  );

  if (typeof data.data?.count !== "number") {
    throw new Error("Invalid response from server");
  }

  return data.data.count;
}

/**
 * Get one event by id for preview. Same shape as public event (host populated). Master only.
 */
export async function getExperienceForPreview(
  id: string,
  token: string
): Promise<PublicEvent> {
  const api = createMasterApi(token);
  const { data } = await api.get<ApiResponse<PublicEvent>>(`/experiences/${id}`);

  if (!data.data) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}

/**
 * Approve or reject an experience. Master only.
 */
export async function setApproval(
  id: string,
  payload: SetApprovalPayload,
  token: string
): Promise<EventResponse> {
  const api = createMasterApi(token);
  const { data } = await api.patch<ApiResponse<EventResponse>>(
    `/experiences/${id}/approval`,
    payload
  );

  if (!data.data) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}
