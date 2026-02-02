/**
 * Base API URL for backend. Must be NEXT_PUBLIC_ to be available in the browser.
 */
const DEFAULT_API_BASE = "http://localhost:3001/api/v1";

export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url) return url.replace(/\/$/, "");
  return DEFAULT_API_BASE;
}

export interface ApiErrorBody {
  message?: string;
  success?: boolean;
  statusCode?: number;
}
