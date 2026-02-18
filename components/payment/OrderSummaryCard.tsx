"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { getOrderSummary, type OrderSummary } from "@/lib/payment-client";
import { formatEventDates } from "@/lib/utils";

interface OrderSummaryCardProps {
  orderId: string;
  /** Animation delay in seconds. Default 1. */
  animationDelay?: number;
}

export function OrderSummaryCard({
  orderId,
  animationDelay = 1,
}: OrderSummaryCardProps) {
  const [summary, setSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    if (!orderId) return;
    getOrderSummary(orderId).then(setSummary);
  }, [orderId]);

  if (!summary) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className="mt-6 w-full max-w-md rounded-xl border border-gray-700 bg-gray-900/80 p-4 text-left md:p-5"
    >
      <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
        Booking summary
      </p>

      <h2 className="mt-1 text-lg font-semibold text-white">
        {summary.eventTitle}
      </h2>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5 shrink-0" />

          {formatEventDates(summary.startDate, summary.endDate).datesText}
        </span>

        {summary.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />

            {summary.location}
          </span>
        )}
      </div>

      <div className="mt-3 border-t border-gray-700 pt-3">
        <ul className="space-y-1.5">
          {summary.ticketBreakdown.map((t, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-gray-300">
                {t.label ?? t.code} × {t.quantity}
                {t.quantity > 1 ? " tickets" : " ticket"}
              </span>

              <span className="text-gray-400">
                ₹{(t.unitPrice * t.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex justify-between border-t border-gray-700 pt-2 text-sm font-semibold text-white">
          <span>Total</span>
          <span>₹{summary.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </motion.div>
  );
}
