"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TOTAL_STEPS, useEventFormStore } from "@/store/event-form-store";
import type { CreateEventPayload } from "@/types";

import Step1Basics from "./steps/Step1Basics";
import Step2Media from "./steps/Step2Media";
import Step3Faqs from "./steps/Step3Faqs";
import Step4Pricing from "./steps/Step4Pricing";

const STEP_NAMES = ["Basics", "Media", "FAQs", "Pricing"] as const;

export interface EventFormBaseProps {
  onSubmit: (payload: CreateEventPayload) => void;
  submitLabel: string;
  submitLoadingLabel: string;
  isSubmitting: boolean;
}

const EventFormBase = ({
  onSubmit,
  submitLabel,
  submitLoadingLabel,
  isSubmitting,
}: EventFormBaseProps) => {
  const router = useRouter();
  const { step } = useEventFormStore();

  const handleCancel = () => {
    router.push("/host/experiences");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancel} asChild>
            <Link href="/host/experiences">Cancel</Link>
          </Button>

          <span className="text-muted-foreground text-sm">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        <span className="text-sm font-medium text-foreground">
          {STEP_NAMES[step - 1]}
        </span>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {step === 1 && <Step1Basics />}

        {step === 2 && <Step2Media />}

        {step === 3 && <Step3Faqs />}

        {step === 4 && (
          <Step4Pricing
            onSubmit={onSubmit}
            submitLabel={submitLabel}
            submitLoadingLabel={submitLoadingLabel}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default EventFormBase;
