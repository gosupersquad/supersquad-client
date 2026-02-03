"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TOTAL_STEPS, useEventFormStore } from "@/store/event-form-store";

import Step1Basics from "./steps/Step1Basics";
import Step2Media from "./steps/Step2Media";

const STEP_NAMES = ["Basics", "Media", "FAQs", "Pricing"] as const;

const EventFormShell = () => {
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

        {step === 3 && (
          <p className="text-muted-foreground py-8 text-center">
            FAQs step — coming next.
          </p>
        )}

        {step === 4 && (
          <p className="text-muted-foreground py-8 text-center">
            Pricing step — coming next.
          </p>
        )}
      </div>
    </div>
  );
};

export default EventFormShell;
