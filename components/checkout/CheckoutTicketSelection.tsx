"use client";

import { Button } from "@/components/ui/button";
import type { EventTicket } from "@/types";
import type { TicketBreakdownItem } from "@/lib/checkout-tickets";

const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

interface CheckoutTicketSelectionProps {
  tickets: EventTicket[];
  breakdown: TicketBreakdownItem[];
  spotsAvailable: number;
  onBreakdownChange: (breakdown: TicketBreakdownItem[]) => void;
}

const CheckoutTicketSelection = ({
  tickets,
  breakdown,
  spotsAvailable,
  onBreakdownChange,
}: CheckoutTicketSelectionProps) => {
  const totalQuantity = breakdown.reduce((s, r) => s + r.quantity, 0);

  const setQuantity = (code: string, quantity: number) => {
    const next = breakdown.map((r) =>
      r.code === code
        ? {
            ...r,
            quantity: Math.max(0, Math.min(spotsAvailable || 999, quantity)),
          }
        : r,
    );
    onBreakdownChange(next);
  };

  const getQuantity = (code: string) =>
    breakdown.find((r) => r.code === code)?.quantity ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-muted-foreground text-sm">No. of attendees</span>

        <span className="font-medium tabular-nums">
          {totalQuantity} {totalQuantity === 1 ? "attendee" : "attendees"}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {tickets.map((ticket) => {
          const qty = getQuantity(ticket.code);
          return (
            <li
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
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(ticket.code, qty - 1)}
                  disabled={qty <= 0}
                >
                  −
                </Button>

                <span className="w-8 text-center font-medium tabular-nums">
                  {qty}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(ticket.code, qty + 1)}
                  disabled={
                    spotsAvailable > 0 && totalQuantity >= spotsAvailable
                  }
                >
                  +
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CheckoutTicketSelection;
