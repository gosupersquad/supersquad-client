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

  const ticket = booking.ticketBreakdown?.find(
    (t) => t.code === attendee.ticketCode,
  );
  const ticketLabel = ticket?.code ?? attendee.ticketCode ?? "—";
  const ticketPrice = ticket?.unitPrice ?? 0;

  const bookingId = booking.id ?? "—";
  const bookingIdLabel =
    bookingId !== "—" ? `Booking Id: #${bookingId}` : "Booking Id: —";

  return (
    <div className="border-border bg-muted/30 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <h4 className="text-muted-foreground truncate text-sm font-light">
            {bookingIdLabel}
          </h4>

          {bookingId !== "—" && (
            <button
              type="button"
              onClick={() => copyToClipboard(bookingId, "Booking Id")}
              className="text-muted-foreground hover:text-foreground shrink-0 rounded p-1"
              aria-label="Copy booking id"
            >
              <Copy className="size-3.5" />
            </button>
          )}
        </div>

        <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium">
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

      {/* Ticket type and price for this attendee (per-ticket, not booking total) */}
      <div className="border-border mt-4 flex flex-wrap gap-4 border-t pt-4">
        <div>
          <span className="text-muted-foreground text-sm">Ticket</span>
          <p className="font-medium capitalize">{ticketLabel}</p>
        </div>

        <div>
          <span className="text-muted-foreground text-sm">Price</span>
          <p className="font-medium text-green-600 dark:text-green-400">
            ₹{ticketPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Part payment not used for events; kept for reference
      <div className="border-border mt-4 flex flex-wrap gap-4 border-t pt-4">
        <div>
          <span className="text-muted-foreground text-sm">Amount Paid</span>
          <p className="font-medium text-green-600 dark:text-green-400">
            ₹{booking.totalAmount.toFixed(2)}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground text-sm">Remaining</span>
          <p className="text-muted-foreground font-medium">₹0.00</p>
        </div>
      </div>
      */}
    </div>
  );
};

export default GuestDetailsCard;
