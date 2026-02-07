"use client";

import { format, parseISO } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { EventTicket, PublicEventHost } from "@/types";

const EventPricingSidebar = ({
  host,
  location,
  startDate,
  endDate,
  dateDisplayText,
  tickets,
  spotsAvailable,
}: {
  host: PublicEventHost;
  location: string;
  startDate: string;
  endDate: string;
  dateDisplayText?: string;
  tickets: EventTicket[];
  spotsAvailable: number;
}) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const minPrice =
    tickets?.length > 0 ? Math.min(...tickets.map((t) => t.price ?? 0)) : 0;
  const total = minPrice * quantity;

  const formatted =
    tickets?.length > 1
      ? `From ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(minPrice)}`
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(minPrice);

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
      <div className="border-border bg-card sticky top-24 space-y-4 rounded-2xl border p-5">
        <div className="flex items-center gap-3">
          <div className="bg-muted size-10 shrink-0 overflow-hidden rounded-full">
            {host.image ? (
              <img
                src={host.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-muted-foreground flex h-full w-full items-center justify-center text-sm font-medium">
                {host.name.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">{host.name}</p>
            <p className="text-muted-foreground truncate">{location}</p>
          </div>
        </div>

        <div className="text-muted-foreground space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" />
            {location}
          </p>

          <p className="flex items-center gap-2">
            <Calendar className="size-4 shrink-0" />
            {dateLabel}
          </p>
        </div>

        <div className="border-border flex items-center justify-between gap-4 border-t pt-4">
          <span className="text-muted-foreground text-sm">Total Price</span>
          <span className="text-xl font-semibold">{formatted}</span>
        </div>

        <Button
          className="w-full bg-emerald-500 font-medium text-white hover:bg-emerald-600"
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
          <SheetHeader>
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

            <p className="text-muted-foreground text-sm">
              Total: {totalFormatted}
            </p>
          </div>

          <Button
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
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
