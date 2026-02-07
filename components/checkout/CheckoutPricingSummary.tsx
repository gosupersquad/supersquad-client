"use client";

import type { TicketBreakdownItem } from "@/lib/checkout-tickets";

const GST_PERCENT = 5;

const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

interface CheckoutPricingSummaryProps {
  breakdown: TicketBreakdownItem[];
}

const CheckoutPricingSummary = ({ breakdown }: CheckoutPricingSummaryProps) => {
  const entryFee = breakdown.reduce(
    (sum, row) => sum + row.quantity * row.unitPrice,
    0,
  );

  const gst = (entryFee * GST_PERCENT) / 100;
  const toPay = entryFee + gst;

  return (
    <div className="border-border bg-card sticky top-24 space-y-3 rounded-xl border p-4">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Entry fee</span>
        <span className="font-medium">{formatInr(entryFee)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">GST ({GST_PERCENT}%)</span>
        <span className="font-medium">{formatInr(gst)}</span>
      </div>

      <div className="border-border border-t border-dotted pt-3">
        <div className="flex justify-between">
          <span className="font-semibold">To pay</span>
          <span className="text-lg font-bold">{formatInr(toPay)}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPricingSummary;
