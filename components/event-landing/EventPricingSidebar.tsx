"use client";

import { useState } from "react";
import { MapPin, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { PublicEventHost } from "@/types";
import type { ExperiencePricing } from "@/types";

const EventPricingSidebar = ({
  host,
  location,
  startDate,
  endDate,
  dateDisplayText,
  pricing,
  spotsAvailable,
}: {
  host: PublicEventHost;
  location: string;
  startDate: string;
  endDate: string;
  dateDisplayText?: string;
  pricing: ExperiencePricing;
  spotsAvailable: number;
}) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
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

  let dateLabel = dateDisplayText?.trim();
  if (!dateLabel) {
    try {
      const start = parseISO(startDate.slice(0, 10));
      const end = parseISO(endDate.slice(0, 10));
      if (start.getTime() === end.getTime()) {
        dateLabel = format(start, "d MMMM ''yy");
      } else {
        dateLabel = `${format(start, "d MMM")} – ${format(end, "d MMM ''yy")}`;
      }
    } catch {
      dateLabel = startDate;
    }
  }

  const onReserve = () => {
    setOpen(false);
    // TODO: checkout
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 sticky top-24">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-muted overflow-hidden shrink-0">
            {host.image ? (
              <img
                src={host.image}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                {host.name.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 text-sm">
            <p className="font-medium truncate">{host.name}</p>
            <p className="text-muted-foreground truncate">{location}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            {location}
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" />
            {dateLabel}
          </p>
        </div>
        <div className="border-t border-border pt-4 flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Total Price</span>
          <span className="text-xl font-semibold">{formatted}</span>
        </div>
        <Button
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
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

export default EventPricingSidebar;
