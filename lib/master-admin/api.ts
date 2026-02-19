import axios, { type AxiosInstance } from "axios";
import { getApiBaseUrl } from "../api-client";

/**
 * Shared axios instance for all MAP (Master Admin Panel) requests.
 * Base URL + Bearer token + JSON content type in one place.
 */
export const createMasterApi = (token: string): AxiosInstance => {
  return axios.create({
    baseURL: `${getApiBaseUrl()}/admin/master`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

/** True when the server returned 403 (e.g. host hit master endpoint). Use with onError to redirect. */
export const isMasterForbidden = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 403;
}
