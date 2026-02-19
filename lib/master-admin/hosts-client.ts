import type { ApiResponse } from "@/types";
import { createMasterApi } from "./api";

export interface HostListItem {
  _id: string;
  name: string;
  username: string;
  email?: string;
  image?: string;
  bio?: string;
  isActive: boolean;
  instagram?: { url?: string; followerCount?: number };
  createdAt: string;
  updatedAt: string;
}

export type HostDetail = HostListItem;

export interface CreateHostPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  image?: string;
  bio?: string;
  isActive?: boolean;
  instagram?: { url?: string; followerCount?: number };
}

export interface UpdateHostPayload {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  image?: string;
  bio?: string;
  isActive?: boolean;
  instagram?: { url?: string; followerCount?: number };
}

export async function listHosts(token: string): Promise<HostListItem[]> {
  const api = createMasterApi(token);
  const { data } = await api.get<ApiResponse<HostListItem[]>>("/hosts");

  if (!Array.isArray(data.data)) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}

export async function getHost(id: string, token: string): Promise<HostDetail> {
  const api = createMasterApi(token);
  const { data } = await api.get<ApiResponse<HostDetail>>(`/hosts/${id}`);

  if (!data.data) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}

export async function createHost(
  payload: CreateHostPayload,
  token: string
): Promise<HostDetail> {
  const api = createMasterApi(token);
  const { data } = await api.post<ApiResponse<HostDetail>>("/hosts", payload);

  if (!data.data) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}

export async function updateHost(
  id: string,
  payload: UpdateHostPayload,
  token: string
): Promise<HostDetail> {
  const api = createMasterApi(token);

  const { data } = await api.put<ApiResponse<HostDetail>>(
    `/hosts/${id}`,
    payload
  );

  if (!data.data) {
    throw new Error("Invalid response from server");
  }

  return data.data;
}
