import axios from "axios";
import type { ApiResponse } from "@/types";
import { getApiBaseUrl } from "./api-client";

export interface DiscountCodeResponse {
  _id: string;
  hostId: string;
  code: string;
  type: "percentage" | "flat";
  amount: number;
  currency: string;
  maxUsage?: number;
  usedCount?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Create payload. v1: flat only (no percentage). experienceId/experienceType omitted. */
export interface CreateDiscountCodePayload {
  code: string;
  type: "flat";
  amount: number;
  currency: "INR";
  maxUsage?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

/** Update payload (partial). Code and type not sent on edit (read-only in UI). v1: flat only. */
export interface UpdateDiscountCodePayload {
  amount?: number;
  maxUsage?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

const DISCOUNT_CODES_BASE = () =>
  `${getApiBaseUrl()}/admin/discount-codes`;

export async function listDiscountCodes(
  token: string
): Promise<DiscountCodeResponse[]> {
  const { data } = await axios.get<ApiResponse<DiscountCodeResponse[]>>(
    DISCOUNT_CODES_BASE(),
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!Array.isArray(data.data)) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}

export async function getDiscountCode(
  id: string,
  token: string
): Promise<DiscountCodeResponse> {
  const { data } = await axios.get<ApiResponse<DiscountCodeResponse>>(
    `${DISCOUNT_CODES_BASE()}/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!data.data) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}

export async function createDiscountCode(
  payload: CreateDiscountCodePayload,
  token: string
): Promise<DiscountCodeResponse> {
  const { data } = await axios.post<ApiResponse<DiscountCodeResponse>>(
    DISCOUNT_CODES_BASE(),
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

export async function updateDiscountCode(
  id: string,
  payload: UpdateDiscountCodePayload,
  token: string
): Promise<DiscountCodeResponse> {
  const { data } = await axios.put<ApiResponse<DiscountCodeResponse>>(
    `${DISCOUNT_CODES_BASE()}/${id}`,
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

export async function toggleDiscountCodeStatus(
  id: string,
  token: string
): Promise<DiscountCodeResponse> {
  const { data } = await axios.put<ApiResponse<DiscountCodeResponse>>(
    `${DISCOUNT_CODES_BASE()}/${id}/toggle-status`,
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

/** Delete a discount code. Server returns 204 No Content. */
export async function deleteDiscountCode(
  id: string,
  token: string
): Promise<void> {
  await axios.delete(`${DISCOUNT_CODES_BASE()}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
