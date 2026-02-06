"use client";

import type { PublicEvent } from "@/types";

import EventDetails from "./EventDetails";
import EventFaqs from "./EventFaqs";
import EventFooter from "./EventFooter";
import EventHeader from "./EventHeader";
import EventHero from "./EventHero";
import EventHostInfo from "./EventHostInfo";
import EventPricingBar from "./EventPricingBar";
import EventPricingSidebar from "./EventPricingSidebar";

interface EventLandingPageProps {
  event: PublicEvent;
}

const EventLandingPage = ({ event }: EventLandingPageProps) => {
  const host = event.hostId;

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-hidden">
      <EventHeader />

      <div className="mx-auto max-w-6xl pb-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr,340px] lg:gap-10">
          <main className="min-w-0 space-y-10 pb-6 md:py-8 lg:pb-0">
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

          <aside className="hidden lg:block lg:pt-0">
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
