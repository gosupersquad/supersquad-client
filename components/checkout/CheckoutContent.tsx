"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import EventHostInfo from "@/components/event-landing/EventHostInfo";
import { Button } from "@/components/ui/button";
import {
  expandBreakdownToAttendeeSlots,
  getCheckoutTicketSelection,
  setCheckoutTicketSelection,
  type TicketBreakdownItem,
} from "@/lib/checkout-tickets";
import { getPublicEvent } from "@/lib/public-event-client";
import type { PublicEvent } from "@/types";

import CheckoutAttendeeBlock, {
  type AttendeeFormData,
  type CheckoutAttendeeBlockHandle,
} from "./CheckoutAttendeeBlock";
import CheckoutExclusiveOffers from "./CheckoutExclusiveOffers";
import CheckoutHero from "./CheckoutHero";
import CheckoutPricingSummary from "./CheckoutPricingSummary";
import CheckoutTicketSelection from "./CheckoutTicketSelection";
import OffersModal from "./OffersModal";

type Params = {
  username: string;
  eventSlug: string;
};

const defaultAttendeeData = (): AttendeeFormData => ({
  name: "",
  email: "",
  phone: "",
  instagram: "",
  customAnswers: {},
});

function buildDefaultBreakdown(
  tickets: PublicEvent["tickets"],
): TicketBreakdownItem[] {
  if (!tickets?.length) return [];

  return tickets.map((t, i) => ({
    code: t.code,
    label: t.label,
    quantity: i === 0 ? 1 : 0,
    unitPrice: t.price ?? 0,
  }));
}

function getInitialBreakdown(
  event: PublicEvent,
  username: string,
  eventSlug: string,
): TicketBreakdownItem[] {
  const tickets = event.tickets ?? [];
  const stored = getCheckoutTicketSelection(username, eventSlug);

  if (stored?.breakdown?.length) {
    return tickets.map((t) => {
      const row = stored.breakdown.find((r) => r.code === t.code);

      return row
        ? { ...row, label: t.label, unitPrice: t.price ?? 0 }
        : {
            code: t.code,
            label: t.label,
            quantity: 0,
            unitPrice: t.price ?? 0,
          };
    });
  }

  return buildDefaultBreakdown(tickets);
}

interface CheckoutContentInnerProps {
  event: PublicEvent;
  username: string;
  eventSlug: string;
}

const CheckoutContentInner = ({
  event,
  username,
  eventSlug,
}: CheckoutContentInnerProps) => {
  const [breakdown, setBreakdown] = useState<TicketBreakdownItem[]>(() =>
    getInitialBreakdown(event, username, eventSlug),
  );

  const [attendeeData, setAttendeeData] = useState<AttendeeFormData[]>(() =>
    expandBreakdownToAttendeeSlots(
      getInitialBreakdown(event, username, eventSlug),
    ).map(() => defaultAttendeeData()),
  );

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const attendeeBlockRefs = useRef<(CheckoutAttendeeBlockHandle | null)[]>([]);

  const slots = useMemo(
    () => expandBreakdownToAttendeeSlots(breakdown),
    [breakdown],
  );

  const attendeeDataPadded = useMemo(
    () => slots.map((_, i) => attendeeData[i] ?? defaultAttendeeData()),
    [slots, attendeeData],
  );

  const setAttendee = useCallback((index: number, data: AttendeeFormData) => {
    setAttendeeData((prev) => {
      const next = [...prev];
      next[index] = data;
      return next;
    });
  }, []);

  const handleBreakdownChange = useCallback(
    (next: TicketBreakdownItem[]) => {
      setBreakdown(next);
      setAttendeeData((prev) => {
        const newSlots = expandBreakdownToAttendeeSlots(next);
        return newSlots.map((_, i) => prev[i] ?? defaultAttendeeData());
      });
      setCheckoutTicketSelection(username, eventSlug, {
        breakdown: next,
        totalQuantity: next.reduce((s, r) => s + r.quantity, 0),
      });
    },
    [username, eventSlug],
  );

  const handleApplyCoupon = useCallback((code: string) => {
    // UI only; wire with backend later
    void code;
  }, []);

  const handlePayAndReserve = useCallback(async () => {
    const refs = attendeeBlockRefs.current
      .slice(0, slots.length)
      .filter(Boolean) as CheckoutAttendeeBlockHandle[];

    if (refs.length === 0) return;
    const results = await Promise.all(refs.map((r) => r.validate()));

    const allValid = results.every(Boolean);
    if (!allValid) {
      toast.error("Please fix the errors in the attendee details below.");
      return;
    }
    // Stubbed for later payment wiring
  }, [slots.length]);

  const host = event.hostId;
  const tickets = event.tickets ?? [];
  const customQuestions = event.customQuestions ?? [];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-6xl md:px-6">
        <div className="min-w-0 space-y-6">
          <CheckoutHero
            media={event.media}
            location={event.location}
            startDate={event.startDate}
            dateDisplayText={event.dateDisplayText}
          />

          <div className="min-w-0 space-y-6 px-4">
            <h1 className="text-2xl font-bold md:text-3xl">{event.title}</h1>
            <EventHostInfo host={host} shareTitle={event.title} />

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Grab your spot now</h2>

              <CheckoutTicketSelection
                tickets={tickets}
                breakdown={breakdown}
                spotsAvailable={event.spotsAvailable}
                onBreakdownChange={handleBreakdownChange}
              />
            </section>

            {slots.length > 0 && (
              <section className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4">
                {slots.map((slot, i) => (
                  <CheckoutAttendeeBlock
                    key={`${slot.code}-${i}`}
                    ref={(el) => {
                      attendeeBlockRefs.current[i] = el;
                    }}
                    index={i}
                    ticketLabel={slot.label}
                    customQuestions={customQuestions}
                    data={attendeeDataPadded[i]}
                    onChange={(data) => setAttendee(i, data)}
                  />
                ))}
              </section>
            )}

            <CheckoutExclusiveOffers
              onOpenCoupons={() => setCouponModalOpen(true)}
            />

            <CheckoutPricingSummary breakdown={breakdown} />

            <Button
              className="mb-14 w-full bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600 md:py-6"
              size="lg"
              onClick={handlePayAndReserve}
            >
              Pay & Reserve Spot
            </Button>
          </div>
        </div>
      </div>

      <OffersModal
        open={couponModalOpen}
        onOpenChange={setCouponModalOpen}
        onApplyCoupon={handleApplyCoupon}
      />
    </div>
  );
};

const CheckoutContent = () => {
  const { username, eventSlug } = useParams<Params>();

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["public-event", username, eventSlug],
    queryFn: () => getPublicEvent(username!, eventSlug!),
    enabled: !!username && !!eventSlug,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-destructive">
          {error instanceof Error ? error.message : "Event not found"}
        </p>
      </div>
    );
  }

  return (
    <CheckoutContentInner
      key={event._id}
      event={event}
      username={username!}
      eventSlug={eventSlug!}
    />
  );
};

export default CheckoutContent;
