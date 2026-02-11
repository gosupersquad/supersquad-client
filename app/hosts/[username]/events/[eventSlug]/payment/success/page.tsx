"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { verifyPayment } from "@/lib/payment-client";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") ?? undefined;

  const [status, setStatus] = useState<
    "idle" | "paid" | "pending" | "failed" | "refunded" | "error"
  >("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await verifyPayment(orderId);
        if (cancelled) return;
        setStatus(result.status);
        setMessage(`Order ${result.orderId}: ${result.status}`);
      } catch {
        if (cancelled) return;
        setStatus("error");
        setMessage("Failed to verify payment");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <p className="text-muted-foreground">Hello World. Missing order_id.</p>
      </div>
    );
  }

  if (status === "idle") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <p className="text-muted-foreground">Verifying payment…</p>
      </div>
    );
  }

  const statusText =
    status === "paid"
      ? "Payment successful."
      : status === "pending"
        ? "Payment is pending."
        : status === "failed"
          ? "Payment failed."
          : status === "refunded"
            ? "Payment refunded."
            : status === "error"
              ? message
              : message;

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 p-4">
      <p className="text-lg font-medium">Hello World</p>
      <p className="text-muted-foreground text-sm">{statusText}</p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center p-4">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
