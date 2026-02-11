"use client";

import { ChevronRight, Tag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AppliedDiscount } from "@/types";

interface CheckoutExclusiveOffersProps {
  appliedDiscount: AppliedDiscount | null;
  onOpenCoupons: () => void;
  onRemoveCoupon: () => void;
}

const CheckoutExclusiveOffers = ({
  appliedDiscount,
  onOpenCoupons,
  onRemoveCoupon,
}: CheckoutExclusiveOffersProps) => {
  return (
    <div className="space-y-2">
      <h2 className="text-foreground text-lg font-semibold">
        Exclusive offers
      </h2>

      {appliedDiscount ? (
        <div className="border-border bg-card flex items-center justify-between gap-2 rounded-xl border px-4 py-3">
          <span className="flex items-center gap-2">
            <Tag className="size-5 text-amber-500" />
            <span className="font-medium uppercase">
              {appliedDiscount.code}
            </span>
            <span className="text-muted-foreground text-sm">
              {`₹${appliedDiscount.amount} off`}
              {/* {appliedDiscount.type === "percentage"
                ? `${appliedDiscount.amount}% off`
                : `₹${appliedDiscount.amount} off`} */}
            </span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove coupon"
            onClick={onRemoveCoupon}
            className="shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="border-border bg-card hover:bg-muted/50 h-auto w-full justify-between rounded-xl border px-4 py-3"
          onClick={onOpenCoupons}
        >
          <span className="flex items-center gap-2">
            <Tag className="size-5 text-amber-500" />
            Apply Coupons
          </span>

          <ChevronRight className="text-muted-foreground size-5" />
        </Button>
      )}
    </div>
  );
};

export default CheckoutExclusiveOffers;
