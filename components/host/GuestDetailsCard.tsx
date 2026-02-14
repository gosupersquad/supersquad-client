"use client";

import { Copy } from "lucide-react";

import { copyToClipboard } from "@/lib/utils";
import type { LeadsAttendee, LeadsBooking } from "@/lib/leads-client";

interface GuestDetailsCardProps {
  attendee: LeadsAttendee;
  booking: LeadsBooking;
}

const GuestDetailsCard = ({ attendee, booking }: GuestDetailsCardProps) => {
  const statusLabel =
    booking.paymentStatus === "paid" ? "confirmed" : booking.paymentStatus;

  const remaining = booking.paymentStatus === "paid" ? 0 : booking.totalAmount;

  return (
    <div className="border-border bg-muted/30 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold">Guest Details</h4>

        <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-sm">Name</span>

            <button
              type="button"
              onClick={() => copyToClipboard(attendee.name, "Name")}
              className="text-muted-foreground hover:text-foreground rounded p-1"
              aria-label="Copy name"
            >
              <Copy className="size-3.5" />
            </button>
          </div>

          <p className="font-medium">{attendee.name}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-sm">Email</span>

            <button
              type="button"
              onClick={() => copyToClipboard(attendee.email, "Email")}
              className="text-muted-foreground hover:text-foreground rounded p-1"
              aria-label="Copy email"
            >
              <Copy className="size-3.5" />
            </button>
          </div>

          <p className="truncate text-sm font-medium">{attendee.email}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-sm">Phone</span>

            <button
              type="button"
              onClick={() => copyToClipboard(attendee.phone, "Phone")}
              className="text-muted-foreground hover:text-foreground rounded p-1"
              aria-label="Copy phone"
            >
              <Copy className="size-3.5" />
            </button>
          </div>

          <p className="font-medium">{attendee.phone}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground text-sm">Instagram</span>

            {attendee.instagram ? (
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(attendee.instagram!, "Instagram")
                }
                className="text-muted-foreground hover:text-foreground rounded p-1"
                aria-label="Copy Instagram"
              >
                <Copy className="size-3.5" />
              </button>
            ) : null}
          </div>

          <p className="text-sm font-medium">
            {attendee.instagram
              ? `@${attendee.instagram.replace(/^@/, "")}`
              : "—"}
          </p>
        </div>
      </div>

      <div className="border-border mt-4 flex flex-wrap gap-4 border-t pt-4">
        <div>
          <span className="text-muted-foreground text-sm">Amount Paid</span>

          <p className="font-medium text-green-600 dark:text-green-400">
            ₹{booking.totalAmount.toFixed(2)}
          </p>
        </div>

        <div>
          <span className="text-muted-foreground text-sm">Remaining</span>

          <p
            className={
              remaining > 0
                ? "font-medium text-orange-600 dark:text-orange-400"
                : "text-muted-foreground font-medium"
            }
          >
            ₹{remaining.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestDetailsCard;
