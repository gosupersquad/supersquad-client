"use client";

import { ChevronRight, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CheckoutExclusiveOffersProps {
  onOpenCoupons: () => void;
}

const CheckoutExclusiveOffers = ({
  onOpenCoupons,
}: CheckoutExclusiveOffersProps) => {
  return (
    <div className="space-y-2">
      <h2 className="text-foreground text-lg font-semibold">
        Exclusive offers
      </h2>

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
    </div>
  );
};

export default CheckoutExclusiveOffers;
