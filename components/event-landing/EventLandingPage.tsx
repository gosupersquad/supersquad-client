"use client";

import type { PublicEvent } from "@/types";

import EventDetails from "./EventDetails";
import EventFaqs from "./EventFaqs";
import EventFooter from "./EventFooter";
import EventHeader from "./EventHeader";
import EventHero from "./EventHero";
import EventInfo from "./EventInfo";
import EventPricingBar from "./EventPricingBar";
import EventPricingSidebar from "./EventPricingSidebar";

interface EventLandingPageProps {
  event: PublicEvent;
}

const EventLandingPage = ({ event }: EventLandingPageProps) => {
  console.log("🚀 ~ EventLandingPage ~ event:", event);
  const host = event.hostId;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <EventHeader />

      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-8 lg:gap-10">
          <main className="min-w-0 pb-6 md:py-8 space-y-10">
            <EventHero title={event.title} media={event.media} />

            <EventInfo host={host} />

            <EventDetails
              location={event.location}
              startDate={event.startDate}
              endDate={event.endDate}
              dateDisplayText={event.dateDisplayText}
              description={event.description}
            />

            <EventFaqs faqs={event.faqs} />

            <EventFooter />
          </main>

          <aside className="hidden lg:block lg:pt-8">
            <EventPricingSidebar
              host={host}
              location={event.location}
              startDate={event.startDate}
              endDate={event.endDate}
              dateDisplayText={event.dateDisplayText}
              pricing={event.pricing}
              spotsAvailable={event.spotsAvailable}
            />
          </aside>
        </div>
      </div>

      <EventPricingBar
        pricing={event.pricing}
        spotsAvailable={event.spotsAvailable}
      />
    </div>
  );
};

export default EventLandingPage;
