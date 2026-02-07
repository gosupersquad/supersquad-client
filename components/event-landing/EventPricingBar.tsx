"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { setCheckoutTicketSelection } from "@/lib/checkout-tickets";
import { cn } from "@/lib/utils";
import type { EventTicket } from "@/types";

const SCROLL_THRESHOLD_PX = 80;

const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

interface EventPricingBarProps {
  tickets: EventTicket[];
  spotsAvailable: number;
}

type Params = {
  username: string;
  eventSlug: string;
};

/**
 * Fixed bottom bar: price (single = amount, multiple = "From ₹X onwards") + CTA.
 * One ticket type → Reserve a spot goes straight to checkout.
 * Multiple ticket types → Reserve a spot opens drawer to pick quantity per type, then checkout.
 */
const EventPricingBar = ({ tickets, spotsAvailable }: EventPricingBarProps) => {
  const [open, setOpen] = useState(false);
  const [showBar, setShowBar] = useState(false);

  /** Per-ticket quantity for drawer (multi-ticket). Index matches tickets array. */
  const [quantities, setQuantities] = useState<number[]>([]);

  const router = useRouter();
  const { username: hostUsername, eventSlug } = useParams<Params>();

  const minPrice =
    tickets?.length > 0 ? Math.min(...tickets.map((t) => t.price ?? 0)) : 0;

  const priceLabel =
    tickets?.length > 1
      ? `From ${formatInr(minPrice)} onwards`
      : formatInr(tickets?.[0]?.price ?? 0);

  const isSingleTicket = tickets?.length <= 1;

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

  const openDrawer = () => {
    if (tickets?.length) setQuantities(tickets.map(() => 0));
    setOpen(true);
  };

  const setQuantity = (index: number, value: number) => {
    const next = [...quantities];
    next[index] = Math.max(0, Math.min(spotsAvailable, value));
    setQuantities(next);
  };

  const totalQuantity = quantities.reduce((a, b) => a + b, 0);
  const totalAmount = tickets?.length
    ? tickets.reduce(
        (sum, t, i) => sum + (t.price ?? 0) * (quantities[i] ?? 0),
        0,
      )
    : 0;

  const goToCheckout = (
    breakdown: {
      code: string;
      label: string;
      quantity: number;
      unitPrice: number;
    }[],
  ) => {
    if (!hostUsername || !eventSlug) return;

    setCheckoutTicketSelection(hostUsername, eventSlug, {
      breakdown,
      totalQuantity: breakdown.reduce((a, b) => a + b.quantity, 0),
    });

    setOpen(false);
    router.push(`/hosts/${hostUsername}/events/${eventSlug}/checkout`);
  };

  const onReserveFromBar = () => {
    if (isSingleTicket && tickets?.length === 1) {
      const t = tickets[0];

      goToCheckout([
        { code: t.code, label: t.label, quantity: 1, unitPrice: t.price ?? 0 },
      ]);
      return;
    }

    openDrawer();
  };

  const onReserveFromDrawer = () => {
    if (totalQuantity === 0) return;

    const breakdown = tickets
      .map((t, i) => ({
        code: t.code,
        label: t.label,
        quantity: quantities[i] ?? 0,
        unitPrice: t.price ?? 0,
      }))
      .filter((row) => row.quantity > 0);

    goToCheckout(breakdown);
  };

  return (
    <>
      <div
        className={cn(
          "border-border bg-background/95 supports-backdrop-filter:bg-background/80 safe-area-pb fixed right-0 bottom-0 left-0 z-40 mx-auto flex max-w-6xl items-center justify-between gap-4 border-t px-4 py-3 pb-4 backdrop-blur transition-transform duration-300 ease-out md:px-6",
          showBar ? "translate-y-0" : "translate-y-full",
        )}
      >
        <span className="text-xl font-semibold">{priceLabel}</span>

        <Button
          className="shrink-0 bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600 md:px-8 md:py-6 md:text-lg"
          size="lg"
          onClick={onReserveFromBar}
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
              {tickets?.map((ticket, index) => (
                <div
                  key={ticket.code}
                  className="border-border bg-card flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{ticket.label}</p>

                    <p className="text-muted-foreground text-sm">
                      {formatInr(ticket.price ?? 0)} each
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(index, (quantities[index] ?? 0) - 1)
                      }
                      disabled={(quantities[index] ?? 0) <= 0}
                    >
                      −
                    </Button>

                    <span className="w-8 text-center font-medium tabular-nums">
                      {quantities[index] ?? 0}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(index, (quantities[index] ?? 0) + 1)
                      }
                      disabled={
                        spotsAvailable > 0 && totalQuantity >= spotsAvailable
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}

              <div className="border-border flex items-center justify-between border-t pt-3">
                <span className="text-muted-foreground text-sm">
                  Total ({totalQuantity}{" "}
                  {totalQuantity === 1 ? "ticket" : "tickets"})
                </span>

                <span className="text-lg font-semibold">
                  {formatInr(totalAmount)}
                </span>
              </div>
            </div>

            <Button
              className="mb-6 w-full bg-emerald-500 text-white hover:bg-emerald-600"
              size="lg"
              onClick={onReserveFromDrawer}
              disabled={totalQuantity === 0}
            >
              Reserve a spot
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default EventPricingBar;
