"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import EventCard from "@/components/host/EventCard";
import GuestDetailsCard from "@/components/host/GuestDetailsCard";
import {
  getLeadsDetail,
  type LeadsAttendee,
  type LeadsBooking,
} from "@/lib/leads-client";
import { toEventCardData } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export default function HostLeadsDetailPage() {
  const params = useParams();
  const router = useRouter();

  const type = typeof params.type === "string" ? params.type : params.type?.[0];
  const id = typeof params.id === "string" ? params.id : params.id?.[0];

  const token = useAuthStore((s) => s.token);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const {
    data: detail,
    isLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ["leads", "detail", type, id],
    queryFn: () =>
      getLeadsDetail(id!, token!, (type as "event" | "trip") ?? "event"),
    enabled: !!token && !!id,
  });

  if (type !== "event") {
    return (
      <div className="p-6">
        <Link
          href="/host/leads"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <p className="text-muted-foreground mt-4">
          Trips are not supported yet.
        </p>
      </div>
    );
  }

  if (isLoading || !id) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-6">
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  if (isError && error) {
    const res = (error as { response?: { status?: number } }).response;
    if (res?.status === 401) {
      clearAuth();

      toast.error("Session expired. Please sign in again.");
      router.push("/host/login");

      return null;
    }
    return (
      <div className="p-6">
        <Link
          href="/host/leads"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <p className="text-destructive">
          Failed to load event. Please try again.
        </p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-6">
        <Link
          href="/host/leads"
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <p className="text-muted-foreground">Event not found.</p>
      </div>
    );
  }

  const totalConfirmed = detail.bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + b.attendees.length, 0);

  const allAttendees: { attendee: LeadsAttendee; booking: LeadsBooking }[] = [];
  detail.bookings.forEach((b) => {
    b.attendees.forEach((a) => allAttendees.push({ attendee: a, booking: b }));
  });

  return (
    <div className="space-y-6 p-6">
      <Link
        href="/host/leads"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <EventCard event={toEventCardData(detail)} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border-border bg-card flex flex-col rounded-xl border p-4 shadow-sm">
          <span className="text-muted-foreground text-sm">Spots Booked</span>

          <p className="mt-1 text-2xl font-bold">
            {String(detail.spotsBooked).padStart(2, "0")}
          </p>

          <p className="text-muted-foreground mt-0.5 text-xs">
            {detail.spotsAvailable} remaining · {detail.totalSpots} total
          </p>
        </div>

        <div className="border-border bg-card flex flex-col rounded-xl border p-4 shadow-sm">
          <span className="text-muted-foreground text-sm">
            Amount Collected
          </span>

          <p className="mt-1 text-2xl font-bold">
            ₹{detail.amountCollected.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Bookings (short list) */}
      <section>
        <h2 className="text-lg font-semibold">Bookings</h2>

        <p className="text-muted-foreground mt-0.5 text-sm">
          {totalConfirmed} spot{totalConfirmed !== 1 ? "s" : ""} confirmed
        </p>

        <ul className="mt-3 space-y-2">
          {detail.bookings.map((booking, idx) => {
            const primaryName =
              booking.attendees[0]?.name ?? `Booking ${idx + 1}`;
            return (
              <li
                key={idx}
                className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3"
              >
                <span className="font-medium">{primaryName}</span>

                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    ₹{booking.totalAmount.toFixed(2)}{" "}
                    {booking.paymentStatus === "paid"
                      ? "paid"
                      : booking.paymentStatus}
                  </span>

                  <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {booking.paymentStatus === "paid"
                      ? "confirmed"
                      : booking.paymentStatus}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        {detail.bookings.length === 0 && (
          <p className="text-muted-foreground mt-2 text-sm">No bookings yet.</p>
        )}
      </section>

      {/* Attendees (Guest Details cards) */}
      {allAttendees.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Guest details</h2>

          <p className="text-muted-foreground mt-0.5 text-sm">
            One card per attendee
          </p>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {allAttendees.map(({ attendee, booking }, idx) => (
              <GuestDetailsCard
                key={`${booking.createdAt}-${attendee.email}-${idx}`}
                attendee={attendee}
                booking={booking}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
