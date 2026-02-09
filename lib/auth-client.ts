import axios from "axios";
import type { ApiResponse } from "@/types";
import { getApiBaseUrl } from "./api-client";

export interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
}

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const base = getApiBaseUrl();

  try {
    const { data } = await axios.post<ApiResponse<LoginResult>>(`${base}/auth/login`, {
      email,
      password,
    });

    if (!data.data?.token || !data.data?.user) {
      throw new Error("Invalid response from server");
    }

    return data.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      const body = err.response.data as { message?: string; error?: string };
      throw new Error(body.message ?? body.error ?? "Invalid email or password");
    }

    throw err;
  }
}
