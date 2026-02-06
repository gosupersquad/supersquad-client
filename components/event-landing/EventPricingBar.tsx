"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
          "border-border bg-background/95 supports-backdrop-filter:bg-background/80 safe-area-pb fixed right-0 bottom-0 left-0 z-40 mx-auto flex max-w-6xl items-center justify-between gap-4 border-t px-4 py-3 pb-4 backdrop-blur transition-transform duration-300 ease-out md:px-6",
          showBar ? "translate-y-0" : "translate-y-full",
        )}
      >
        <span className="text-xl font-semibold">{formatted}</span>

        <Button
          className="shrink-0 bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600 md:px-8 md:py-6 md:text-lg"
          size="lg"
          onClick={() => setOpen(true)}
        >
          Reserve a spot
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="flex h-[50vh] flex-col rounded-t-2xl"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 md:px-6">
            <SheetHeader className="-mx-5">
              <SheetTitle>Select tickets</SheetTitle>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-auto py-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground text-sm">Quantity</span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </Button>

                  <span className="w-8 text-center font-medium">
                    {quantity}
                  </span>

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

              <p className="text-muted-foreground text-sm">
                Total: {totalFormatted}
              </p>
            </div>

            <Button
              className="mb-6 w-full bg-emerald-500 text-white hover:bg-emerald-600"
              size="lg"
              onClick={onReserve}
            >
              Proceed to checkout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EventPricingBar;
