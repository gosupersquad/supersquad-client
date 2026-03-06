"use client";

import { Button } from "@/components/ui/button";
import { useEventFormStore } from "@/store/event-form-store";

/**
 * Step 3 when isFreeRsvp: no ticket form (free RSVP uses single ticket from Step 2 spots).
 * Back / Next only.
 */
const Step3TicketsSkip = () => {
  const { prevStep, nextStep } = useEventFormStore();

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Free RSVP — no tickets to set. Spots are configured in Event details.
      </p>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>

        <Button type="button" onClick={nextStep}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step3TicketsSkip;
