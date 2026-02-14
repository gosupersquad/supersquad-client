"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";

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

  const [searchQuery, setSearchQuery] = useState("");

  const allAttendees = useMemo(() => {
    if (!detail?.bookings) return [];

    const out: { attendee: LeadsAttendee; booking: LeadsBooking }[] = [];
    detail.bookings.forEach((b) => {
      b.attendees.forEach((a) => out.push({ attendee: a, booking: b }));
    });

    return out;
  }, [detail]);

  const filteredAttendees = useMemo(() => {
    if (!searchQuery.trim()) return allAttendees;

    const q = searchQuery.trim().toLowerCase();

    return allAttendees.filter(
      ({ attendee }) =>
        attendee.name.toLowerCase().includes(q) ||
        attendee.email.toLowerCase().includes(q) ||
        attendee.phone.includes(q) ||
        (attendee.instagram?.toLowerCase().includes(q) ?? false),
    );
  }, [allAttendees, searchQuery]);

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

      {/* Bookings */}
      <section>
        <h2 className="text-lg font-semibold">Bookings</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {totalConfirmed} spot{totalConfirmed !== 1 ? "s" : ""} confirmed
        </p>
        {detail.bookings.length === 0 && (
          <p className="text-muted-foreground mt-2 text-sm">No bookings yet.</p>
        )}
      </section>

      {/* Guest details: search + cards */}
      {allAttendees.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Guest details</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            One card per attendee
          </p>
          <div className="relative mt-3">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

            <Input
              placeholder="Search by name, email, phone, Instagram…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {filteredAttendees.map(({ attendee, booking }, idx) => (
              <GuestDetailsCard
                key={
                  booking.id
                    ? `${booking.id}-${attendee.email}-${idx}`
                    : `${booking.createdAt}-${attendee.email}-${idx}`
                }
                attendee={attendee}
                booking={booking}
              />
            ))}
          </div>

          {filteredAttendees.length === 0 && (
            <p className="text-muted-foreground mt-4 text-sm">
              No attendees match your search.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
