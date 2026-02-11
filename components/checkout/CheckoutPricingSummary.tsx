"use client";

import type { TicketBreakdownItem } from "@/lib/checkout-tickets";
import { GST_PERCENT } from "@/lib/constants";
import type { AppliedDiscount } from "@/types";

const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

interface CheckoutPricingSummaryProps {
  breakdown: TicketBreakdownItem[];
  appliedDiscount: AppliedDiscount | null;
}

const CheckoutPricingSummary = ({
  breakdown,
  appliedDiscount,
}: CheckoutPricingSummaryProps) => {
  const entryFee = breakdown.reduce(
    (sum, row) => sum + row.quantity * row.unitPrice,
    0,
  );

  const discountAmount = appliedDiscount
    ? appliedDiscount.type === "flat"
      ? Math.min(appliedDiscount.amount, entryFee)
      : 0
    : 0;

  const subtotalAfterDiscount = entryFee - discountAmount;
  const gst = (subtotalAfterDiscount * GST_PERCENT) / 100;
  const toPay = subtotalAfterDiscount + gst;

  return (
    <div className="border-border bg-card sticky top-24 space-y-3 rounded-xl border p-4">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Entry fee</span>
        <span className="font-medium">{formatInr(entryFee)}</span>
      </div>

      {appliedDiscount && discountAmount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Discount ({appliedDiscount.code})
          </span>
          <span className="font-medium text-emerald-600">
            -{formatInr(discountAmount)}
          </span>
        </div>
      )}

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
