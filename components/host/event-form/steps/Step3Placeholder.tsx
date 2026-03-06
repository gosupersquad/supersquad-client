"use client";

import { Button } from "@/components/ui/button";
import { useEventFormStore } from "@/store/event-form-store";

/** Placeholder for Step 3 (Tickets). Full Tickets step content will replace this when step components are reordered. */
const Step3Placeholder = () => {
  const { prevStep, nextStep } = useEventFormStore();

  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button type="button" variant="outline" onClick={prevStep}>
        Back
      </Button>
      <Button type="button" onClick={nextStep}>
        Next
      </Button>
    </div>
  );
};

export default Step3Placeholder;
