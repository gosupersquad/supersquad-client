"use client";

import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { useEventFormStore } from "@/store/event-form-store";

import EventMediaUpload from "./Step2Media";

/**
 * Step 1 – Media: media upload (max 6).
 * Reads/writes: media. Back / Next.
 */
const Step1Media = () => {
  const { nextStep } = useEventFormStore();

  return (
    <div className="space-y-8">
      <FieldGroup className="gap-4">
        <EventMediaUpload maxItems={6} />
      </FieldGroup>

      <div className="flex justify-end gap-3 pt-2">
        {/* <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button> */}

        <Button type="button" onClick={nextStep}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step1Media;
