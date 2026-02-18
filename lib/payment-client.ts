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

/** Order summary for payment status page (event title, dates, tickets, total). */
export interface OrderSummary {
  orderId: string;
  eventTitle: string;
  startDate: string;
  endDate: string;
  location?: string;
  ticketBreakdown: {
    code: string;
    label?: string;
    quantity: number;
    unitPrice: number;
  }[];
  /** Applied coupon: code name and discount amount in ₹. */
  discountCode?: { codeName: string; amount: number };
  totalAmount: number;
}

/** Fetch order summary by orderId. Returns null if not found (e.g. 404). */
export async function getOrderSummary(
  orderId: string
): Promise<OrderSummary | null> {
  try {
    const { data } = await axios.get<ApiResponse<OrderSummary>>(
      `${PAYMENTS_BASE()}/order-summary`,
      { params: { orderId } }
    );

    if (!data.success || !data.data) return null;

    return data.data;
  } catch {
    return null;
  }
}
