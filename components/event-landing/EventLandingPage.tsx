"use client";

import { AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import type { MediaItem, PublicEvent } from "@/types";

import EventContactHost from "./EventContactHost";
import EventDetails from "./EventDetails";
import EventFaqs from "./EventFaqs";
import EventFooter from "./EventFooter";
import EventHeader from "./EventHeader";
import EventHero from "./EventHero";
import EventHostInfo from "./EventHostInfo";
import EventPricingBar from "./EventPricingBar";
import EventSponsors from "./EventSponsors";

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
  const showApprovalAlert =
    event.approvalStatus === "pending" || event.approvalStatus === "rejected";

  return (
    <div className="text-foreground relative min-h-screen overflow-x-hidden">
      <EventLandingBlurBackground firstMedia={event.media?.[0]} />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {showApprovalAlert && <ApprovalAlert event={event} />}

        <EventHeader />

        <div className="pb-4">
          <main className="min-w-0 pb-24 md:pb-16">
            <EventHero title={event.title} media={event.media} />

            <EventHostInfo host={host} shareTitle={event.title} />

            <Separator className="my-6" />

            <EventDetails
              location={event.location}
              startDate={event.startDate}
              endDate={event.endDate}
              description={event.description}
            />

            <EventSponsors sponsors={event.sponsors} />

            <EventFaqs faqs={event.faqs} />

            <EventContactHost host={host} />

            <EventFooter />
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
    </div>
  );
};

const EventLandingBlurBackground = ({
  firstMedia,
}: {
  firstMedia: MediaItem | undefined;
}) => {
  if (!firstMedia?.url) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-0 h-[70vh] overflow-hidden opacity-45">
      <div className="absolute inset-0 scale-110 blur-xl">
        {firstMedia.type === "image" ? (
          <Image
            src={firstMedia.url}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          // Video URL fallback; next/image is for images only
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstMedia.url}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-black/40" aria-hidden />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#121212] to-transparent"
        aria-hidden
      />
    </div>
  );
};

const ApprovalAlert = ({ event }: { event: PublicEvent }) => {
  return (
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

      <Link
        href="/host/experiences"
        className="ml-3 shrink-0 rounded-md border border-amber-600/50 bg-amber-500/25 px-3 py-1.5 text-sm font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-500/40 active:bg-amber-500/50 dark:text-amber-100"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default EventLandingPage;
