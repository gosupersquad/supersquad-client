import axios from "axios";

/**
 * True when the API returned 403 with "account deactivated" (host was deactivated by master admin).
 * Use this to clear auth and redirect to /host/login in one central place (e.g. React Query onError).
 */
export function is403AccountDeactivated(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response?.status !== 403) {
    return false;
  }

  const message =
    (error.response?.data as { message?: string } | undefined)?.message ?? "";

  return message.toLowerCase().includes("account deactivated");
}
