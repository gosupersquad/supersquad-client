"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TOTAL_STEPS, useEventFormStore } from "@/store/event-form-store";
import type { CreateEventPayload } from "@/types";

import Step1Media from "./steps/Step1Media";
import Step2EventDetails from "./steps/Step2EventDetails";
import Step3Faqs from "./steps/Step3Faqs";
import Step4Pricing from "./steps/Step4Pricing";

/** Step order: 1 = Media, 2 = Event details, 3 = Tickets, 4 = FAQs + questions + coupons. */
const STEP_NAMES = [
  "Media",
  "Event details",
  "Tickets",
  "One last step",
] as const;

export type EventFormMode = "create" | "edit";

const SUBMIT_LABELS: Record<
  EventFormMode,
  { label: string; loadingLabel: string }
> = {
  create: { label: "Create event", loadingLabel: "Creating…" },
  edit: { label: "Update event", loadingLabel: "Updating…" },
};

export interface EventFormBaseProps {
  mode: EventFormMode;
  onSubmit: (payload: CreateEventPayload) => void;
  isSubmitting: boolean;
}

const EventFormBase = ({
  mode,
  onSubmit,
  isSubmitting,
}: EventFormBaseProps) => {
  const router = useRouter();
  const { step } = useEventFormStore();
  const { label: submitLabel, loadingLabel: submitLoadingLabel } =
    SUBMIT_LABELS[mode];

  const handleCancel = () => {
    router.push("/host/experiences");
  };

  return (
    <div className="bg-background min-h-screen pb-20 md:pb-6">
      <div className="border-border bg-background sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancel} asChild>
            <Link href="/host/experiences">Cancel</Link>
          </Button>

          <span className="text-muted-foreground text-sm">
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>

        <span className="text-foreground text-sm font-medium">
          {STEP_NAMES[step - 1]}
        </span>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {step === 1 && <Step1Media />}

        {step === 2 && <Step2EventDetails mode={mode} />}

        {step === 3 && <Step4Pricing />}

        {step === 4 && (
          <Step3Faqs
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
