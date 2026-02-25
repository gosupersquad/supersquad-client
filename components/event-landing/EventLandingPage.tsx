"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";

import type { PublicEvent } from "@/types";

import EventDetails from "./EventDetails";
import EventFaqs from "./EventFaqs";
import EventFooter from "./EventFooter";
import EventHeader from "./EventHeader";
import EventHero from "./EventHero";
import EventHostInfo from "./EventHostInfo";
import EventPricingBar from "./EventPricingBar";

interface EventLandingPageProps {
  event: PublicEvent;
  /** When true, hide the Reserve/Book CTA (e.g. for master admin preview). */
  preview?: boolean;
}

const EventLandingPage = ({
  event,
  preview = false,
}: EventLandingPageProps) => {
  const host = event.hostId;

  const [approvalAlertDismissed, setApprovalAlertDismissed] = useState(false);
  const showApprovalAlert =
    !approvalAlertDismissed &&
    (event.approvalStatus === "pending" || event.approvalStatus === "rejected");

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      {showApprovalAlert && (
        <div
          className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm font-medium text-amber-800 dark:text-amber-200"
          role="status"
        >
          <AlertCircle className="size-4 shrink-0" aria-hidden />

          <span>
            {event.approvalStatus === "pending"
              ? "Your event is under review"
              : event.rejectedReason
                ? `Rejected: ${event.rejectedReason}`
                : "Your event has been rejected"}
          </span>

          <button
            type="button"
            onClick={() => setApprovalAlertDismissed(true)}
            className="ml-1 rounded p-1 transition-colors hover:bg-amber-500/20"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <EventHeader />

      <div className="mx-auto max-w-6xl pb-4 md:px-6">
        <main className="min-w-0 space-y-10 pb-24 md:py-8 md:pb-16">
          <EventHero title={event.title} media={event.media} />

          <div className="space-y-10 px-4 md:px-0">
            <EventHostInfo host={host} shareTitle={event.title} />

            <EventDetails
              location={event.location}
              startDate={event.startDate}
              endDate={event.endDate}
              dateDisplayText={event.dateDisplayText}
              description={event.description}
            />

            <EventFaqs faqs={event.faqs} />

            <EventFooter />
          </div>
        </main>
      </div>

      {!preview &&
        event.approvalStatus !== "pending" &&
        event.approvalStatus !== "rejected" && (
          <EventPricingBar
            tickets={event.tickets}
            spotsAvailable={event.spotsAvailable}
          />
        )}
    </div>
  );
};

export default EventLandingPage;
