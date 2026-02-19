import axios from "axios";
import type { ApiResponse, MediaItem } from "@/types";
import { getApiBaseUrl } from "./api-client";

/**
 * Upload one or more images/videos in one request. Field name "files".
 * Returns items in upload order. Use for both "Add images" and "Add video".
 * @param folder - "events" (default) or "hosts"
 */
export async function uploadMedia(
  files: File[],
  token: string,
  folder: "events" | "hosts" = "events"
): Promise<{ items: MediaItem[] }> {
  const base = getApiBaseUrl();
  const form = new FormData();
  files.forEach((f) => form.append("files", f));

  const { data } = await axios.post<ApiResponse<{ items: MediaItem[] }>>(
    `${base}/upload/media?folder=${folder}`,
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!data.data?.items) {
    throw new Error("Invalid response from upload");
  }
  return data.data;
}
