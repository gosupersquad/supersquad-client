"use client";

import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { useEventFormStore } from "@/store/event-form-store";

import EventMediaUpload from "./Step2Media";

/**
 * Step 1 – Media: media upload (max 6) and Free RSVP toggle.
 * Reads/writes: media, basics.isFreeRsvp. Back / Next.
 */
const Step1Media = () => {
  const { basics, setBasics, prevStep, nextStep } = useEventFormStore();

  return (
    <div className="space-y-8">
      <FieldGroup className="gap-4">
        <EventMediaUpload maxItems={6} />

        <div className="border-border flex items-center justify-between gap-4 rounded-lg border p-4">
          <FieldLabel className="text-muted-foreground font-normal">
            Free RSVP — no payment required; guests reserve a spot and go
            straight to confirmation.
          </FieldLabel>

          <Switch
            checked={basics.isFreeRsvp ?? false}
            onCheckedChange={(checked) => {
              setBasics({ isFreeRsvp: checked === true });
            }}
          />
        </div>
      </FieldGroup>

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

export default Step1Media;
