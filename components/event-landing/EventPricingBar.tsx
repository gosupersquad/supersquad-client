"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ExperiencePricing } from "@/types";

const SCROLL_THRESHOLD_PX = 80;

/** Fixed bottom bar on mobile: visible only after scrolling down; slide in/out animation. */
const EventPricingBar = ({
  pricing,
  spotsAvailable,
}: {
  pricing: ExperiencePricing;
  spotsAvailable: number;
}) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showBar, setShowBar] = useState(false);
  const price = pricing?.price ?? 0;
  const total = price * quantity;
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
  const totalFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(total);

  useEffect(() => {
    const onScroll = () => {
      setShowBar(
        typeof window !== "undefined" && window.scrollY > SCROLL_THRESHOLD_PX,
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onReserve = () => {
    setOpen(false);
    // TODO: checkout
  };

  return (
    <>
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3 flex items-center justify-between gap-4 safe-area-pb transition-transform duration-300 ease-out",
          showBar ? "translate-y-0" : "translate-y-full",
        )}
      >
        <span className="text-xl font-semibold">{formatted}</span>
        <Button
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shrink-0"
          size="lg"
          onClick={() => setOpen(true)}
        >
          Reserve a spot
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="h-[50vh] rounded-t-2xl flex flex-col"
        >
          <SheetHeader>
            <SheetTitle>Select tickets</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto py-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Quantity</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setQuantity((q) =>
                      spotsAvailable > 0
                        ? Math.min(spotsAvailable, q + 1)
                        : q + 1,
                    )
                  }
                >
                  +
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Total: {totalFormatted}
            </p>
          </div>
          <Button
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            size="lg"
            onClick={onReserve}
          >
            Proceed to checkout
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EventPricingBar;
