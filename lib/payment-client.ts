import axios from "axios";
import type {
  ApiResponse,
  CreateOrderPayload,
  CreateOrderResult,
  VerifyPaymentResult,
} from "@/types";
import { getApiBaseUrl } from "./api-client";

const PAYMENTS_BASE = () => `${getApiBaseUrl()}/payments`;

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResult> {
  const { data } = await axios.post<ApiResponse<CreateOrderResult>>(
    `${PAYMENTS_BASE()}/create-order`,
    payload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!data.success || !data.data) {
    throw new Error(data.message ?? "Failed to create order");
  }

  return data.data;
}

export async function verifyPayment(
  orderId: string
): Promise<VerifyPaymentResult> {
  const { data } = await axios.post<ApiResponse<VerifyPaymentResult>>(
    `${PAYMENTS_BASE()}/verify`,
    { orderId },
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!data.success || !data.data) {
    throw new Error(data.message ?? "Failed to verify payment");
  }

  return data.data;
}
