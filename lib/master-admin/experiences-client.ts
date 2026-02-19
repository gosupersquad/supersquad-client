import axios from "axios";
import type { ApiResponse, MediaItem } from "@/types";
import { getApiBaseUrl } from "../api-client";
import type { EventResponse } from "../experiences-client";
import type { PublicEvent } from "@/types";

const MASTER_EXPERIENCES_BASE = () =>
  `${getApiBaseUrl()}/admin/master/experiences`;

/** Slim list item for pending-approval cards. */
export interface MasterEventListItem {
  id: string;
  title: string;
  slug: string;
  host: { name: string; username: string };
  approvalStatus: string;
  spotsAvailable: number;
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
  const { data } = await axios.get<ApiResponse<MasterEventListItem[]>>(
    MASTER_EXPERIENCES_BASE(),
    {
      params: { approvalStatus },
      headers: { Authorization: `Bearer ${token}` },
    }
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
  const { data } = await axios.get<ApiResponse<{ count: number }>>(
    `${MASTER_EXPERIENCES_BASE()}/count`,
    {
      params: { approvalStatus },
      headers: { Authorization: `Bearer ${token}` },
    }
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
  const { data } = await axios.get<ApiResponse<PublicEvent>>(
    `${MASTER_EXPERIENCES_BASE()}/${id}`,
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
 * Approve or reject an experience. Master only.
 */
export async function setApproval(
  id: string,
  payload: SetApprovalPayload,
  token: string
): Promise<EventResponse> {
  const { data } = await axios.patch<ApiResponse<EventResponse>>(
    `${MASTER_EXPERIENCES_BASE()}/${id}/approval`,
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

/** True when the server returned 403 (e.g. host hit master endpoint). Use with onError to redirect. */
export function isMasterForbidden(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 403;
}
