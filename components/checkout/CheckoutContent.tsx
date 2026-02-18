"use client";

import { load } from "@cashfreepayments/cashfree-js";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
import { validateDiscountCode } from "@/lib/discount-codes-client";
import { createOrder } from "@/lib/payment-client";
import { getPublicEvent } from "@/lib/public-event-client";
import { cn, generateOrderId } from "@/lib/utils";
import type { AppliedDiscount, CreateOrderPayload, PublicEvent } from "@/types";

import CheckoutAttendeeBlock, {
  type AttendeeFormData,
  type CheckoutAttendeeBlockHandle,
} from "./CheckoutAttendeeBlock";
import CheckoutExclusiveOffers from "./CheckoutExclusiveOffers";
import CheckoutHero from "./CheckoutHero";
import CheckoutPricingSummary from "./CheckoutPricingSummary";
import CheckoutTicketSelection from "./CheckoutTicketSelection";
import OffersModal from "./OffersModal";
import { computeGstFromSubtotal } from "@/lib/pricing";

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
  const router = useRouter();

  const [breakdown, setBreakdown] = useState<TicketBreakdownItem[]>(() =>
    getInitialBreakdown(event, username, eventSlug),
  );

  const [attendeeData, setAttendeeData] = useState<AttendeeFormData[]>(() =>
    expandBreakdownToAttendeeSlots(
      getInitialBreakdown(event, username, eventSlug),
    ).map(() => defaultAttendeeData()),
  );

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] =
    useState<AppliedDiscount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const attendeeBlockRefs = useRef<(CheckoutAttendeeBlockHandle | null)[]>([]);

  const slots = useMemo(
    () => expandBreakdownToAttendeeSlots(breakdown),
    [breakdown],
  );

  const attendeeDataPadded = useMemo(
    () => slots.map((_, i) => attendeeData[i] ?? defaultAttendeeData()),
    [slots, attendeeData],
  );

  const expectedTotal = useMemo(() => {
    const entryFee = breakdown.reduce(
      (sum, row) => sum + row.quantity * row.unitPrice,
      0,
    );

    const discountAmount = appliedDiscount
      ? appliedDiscount.type === "percentage"
        ? Math.min((entryFee * appliedDiscount.amount) / 100, entryFee)
        : Math.min(appliedDiscount.amount, entryFee)
      : 0;

    const subtotalAfterDiscount = entryFee - discountAmount;
    const { total } = computeGstFromSubtotal(subtotalAfterDiscount);

    return total;
  }, [breakdown, appliedDiscount]);

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

  const handleApplyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      try {
        const result = await validateDiscountCode(code, event._id);

        if (result.valid && result.discount) {
          setAppliedDiscount({
            code: code.trim().toUpperCase(),
            type: result.discount.type ?? "flat",
            amount: result.discount.amount,
            currency: result.discount.currency,
            discountCodeId: result.discount.discountCodeId,
          });
          setCouponModalOpen(false);
          toast.success("Coupon applied");
          return true;
        }

        toast.error(result.message ?? "Invalid code");
        return false;
      } catch {
        toast.error("Could not validate coupon");
        return false;
      }
    },
    [event._id],
  );

  const handleRemoveCoupon = useCallback(() => {
    setAppliedDiscount(null);
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

    const first = attendeeDataPadded[0];
    if (
      !first?.name?.trim() ||
      !first?.email?.trim() ||
      !first?.phone?.trim()
    ) {
      toast.error("Please fill in all required attendee details.");
      return;
    }

    const orderId = generateOrderId();

    const returnUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/hosts/${username}/events/${eventSlug}/payment/status?order_id=${orderId}`
        : "";

    const payload: CreateOrderPayload = {
      eventId: event._id,
      returnUrl,
      orderId,
      customer: {
        name: first.name.trim(),
        email: first.email.trim(),
        phone: first.phone.trim(),
        instagram: first.instagram?.trim() || undefined,
      },
      ticketBreakdown: breakdown
        .filter((r) => r.quantity > 0)
        .map(({ code, quantity, unitPrice }) => ({
          code,
          quantity,
          unitPrice,
        })),
      attendees: slots.map((slot, i) => {
        const data = attendeeDataPadded[i] ?? defaultAttendeeData();
        return {
          ticketCode: slot.code,
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          instagram: data.instagram?.trim() || undefined,
          customAnswers:
            data.customAnswers && Object.keys(data.customAnswers).length > 0
              ? data.customAnswers
              : undefined,
        };
      }),
      expectedTotal,
      discountCode: (() => {
        if (!appliedDiscount?.discountCodeId) return undefined;

        const entryFee = breakdown.reduce(
          (s, r) => s + r.quantity * r.unitPrice,
          0,
        );
        const amountInRupees =
          appliedDiscount.type === "percentage"
            ? Math.min((entryFee * appliedDiscount.amount) / 100, entryFee)
            : Math.min(appliedDiscount.amount, entryFee);

        return {
          id: appliedDiscount.discountCodeId,
          codeName: appliedDiscount.code,
          amount: amountInRupees,
        };
      })(),
    };

    setIsSubmitting(true);
    try {
      const result = await createOrder(payload);

      if (result.freeRsvp) {
        router.push(
          `/hosts/${username}/events/${eventSlug}/payment/status?order_id=${result.orderId}`,
        );
        return;
      }

      if (!result.sessionId) {
        toast.error(
          "Payment could not be loaded. Please try again. No session ID.",
        );
        setIsSubmitting(false);
        return;
      }

      const cashfreeEnv =
        (process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT as
          | "sandbox"
          | "production") ?? "sandbox";

      const cashfree = await load({ mode: cashfreeEnv });
      if (!cashfree) {
        toast.error("Payment could not be loaded. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const checkoutOptions = {
        paymentSessionId: result.sessionId,
        returnUrl,
      };

      const checkoutResult = await cashfree.checkout(checkoutOptions);

      if (checkoutResult.error) {
        toast.error(checkoutResult.error.message ?? "Checkout failed");
        setIsSubmitting(false);
        return;
      }

      if (checkoutResult.redirect) {
        // User is redirected to Cashfree PG; success page will verify
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      toast.error(message);
      setIsSubmitting(false);
    }
  }, [
    slots,
    attendeeDataPadded,
    breakdown,
    appliedDiscount,
    expectedTotal,
    event._id,
    username,
    eventSlug,
    router,
  ]);

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

            {!event.isFreeRsvp && (
              <CheckoutExclusiveOffers
                appliedDiscount={appliedDiscount}
                onOpenCoupons={() => setCouponModalOpen(true)}
                onRemoveCoupon={handleRemoveCoupon}
              />
            )}

            <CheckoutPricingSummary
              breakdown={breakdown}
              appliedDiscount={appliedDiscount}
            />

            <Button
              className={cn(
                "mb-14 w-full text-base font-semibold md:py-6",
                event.spotsAvailable === 0 || isSubmitting
                  ? "cursor-not-allowed bg-gray-400 text-white hover:bg-gray-400"
                  : "bg-emerald-500 text-white hover:bg-emerald-600",
              )}
              size="lg"
              onClick={handlePayAndReserve}
              disabled={event.spotsAvailable === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing…
                </>
              ) : event.spotsAvailable === 0 ? (
                "Sold out"
              ) : event.isFreeRsvp ? (
                "Reserve spot"
              ) : (
                "Pay & Reserve Spot"
              )}
            </Button>
          </div>
        </div>
      </div>

      <OffersModal
        open={couponModalOpen}
        onOpenChange={setCouponModalOpen}
        username={username}
        eventSlug={eventSlug}
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
