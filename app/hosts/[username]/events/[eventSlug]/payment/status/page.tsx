"use client";

import { motion } from "framer-motion";
import { Check, Loader2, ReceiptIndianRupee, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { OrderSummaryCard } from "@/components/payment/OrderSummaryCard";
import { verifyPayment } from "@/lib/payment-client";

type DisplayStatus = "VERIFYING" | "SUCCESS" | "PENDING" | "FAILED";

interface StatusConfig {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  title: string;
  message: string;
  iconAnimation?: string;
}

const STATUS_CONFIG: Record<DisplayStatus, StatusConfig> = {
  VERIFYING: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-500",
    title: "Verifying Payment",
    message: "Please wait while we verify your payment status...",
    iconAnimation: "animate-spin",
  },
  SUCCESS: {
    icon: Check,
    color: "text-[#15cd72]",
    bgColor: "bg-[#15cd72]",
    title: "Payment Successful!",
    message:
      "You will receive your booking confirmation and other details shortly on your email.",
  },
  PENDING: {
    icon: Loader2,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
    title: "Payment Pending",
    message:
      "Your payment is being processed. We'll send you an email once it's confirmed. This usually takes a few minutes.",
    iconAnimation: "animate-spin",
  },
  FAILED: {
    icon: X,
    color: "text-red-500",
    bgColor: "bg-red-500",
    title: "Payment Failed",
    message:
      "We couldn't process your payment. If any amount was deducted, it will be automatically refunded within 3-5 business days.",
  },
};

function mapApiStatusToDisplay(
  status: "idle" | "paid" | "pending" | "failed" | "refunded" | "error",
): DisplayStatus {
  if (status === "idle") return "VERIFYING";
  if (status === "paid") return "SUCCESS";
  if (status === "pending") return "PENDING";
  return "FAILED";
}

const PaymentStatusInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") ?? undefined;

  const [displayStatus, setDisplayStatus] =
    useState<DisplayStatus>("VERIFYING");
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (!orderId || verificationAttempted.current) return;

    const verify = async () => {
      verificationAttempted.current = true;

      try {
        const result = await verifyPayment(orderId);
        setDisplayStatus(mapApiStatusToDisplay(result.status));
      } catch {
        toast.error("Failed to verify payment status");
        setDisplayStatus("FAILED");
      }
    };

    verify();
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
        <p className="text-gray-400">Missing order_id.</p>
      </div>
    );
  }

  const config = STATUS_CONFIG[displayStatus];
  const Icon = config.icon;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4">
      <div className="relative mb-4 md:mb-8">
        {/* Background currency icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`${config.color} opacity-20`}
        >
          <ReceiptIndianRupee
            size={120}
            className="md:h-[180px] md:w-[180px]"
            strokeWidth={1.5}
          />
        </motion.div>

        {/* Status icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className={`${config.bgColor} rounded-full p-3 md:p-4`}>
            <Icon
              size={32}
              className={`text-black md:h-12 md:w-12 ${config.iconAnimation ?? ""}`}
            />
          </div>
        </motion.div>
      </div>

      {/* Status message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="px-4 text-center md:px-0"
      >
        <h1 className="mb-3 text-2xl font-bold text-white md:mb-4 md:text-4xl">
          {config.title}
        </h1>

        <p className="max-w-md text-base text-gray-400 md:text-lg">
          {config.message}
        </p>

        {orderId && <OrderSummaryCard orderId={orderId} />}

        <div className="mt-6 flex flex-col justify-center gap-3 md:mt-8 md:flex-row">
          {displayStatus === "FAILED" && (
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-100 md:px-6 md:text-base"
            >
              Try Again
            </button>
          )}

          {displayStatus === "SUCCESS" ? (
            <a
              href="https://www.instagram.com/supersquad.club/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-black transition-colors hover:bg-gray-100 md:px-6 md:text-base"
            >
              Follow us on Instagram
            </a>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-100 md:px-6 md:text-base"
            >
              Back
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const PaymentStatusPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
          <p className="text-gray-400">Loading…</p>
        </div>
      }
    >
      <PaymentStatusInner />
    </Suspense>
  );
};

export default PaymentStatusPage;
