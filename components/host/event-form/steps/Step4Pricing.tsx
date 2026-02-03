"use client";

import toast from "react-hot-toast";

import RequiredMark from "@/components/custom/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEventFormStore } from "@/store/event-form-store";
import type {
  CreateEventPayload,
  EventFormBasics,
  ExperienceFAQ,
  ExperiencePricing,
  MediaItem,
} from "@/types";

export const buildEventCreatePayload = (
  basics: EventFormBasics,
  media: MediaItem[],
  faqs: ExperienceFAQ[],
  pricing: ExperiencePricing,
): CreateEventPayload => ({
  title: basics.title,
  ...(basics.slug?.trim() ? { slug: basics.slug.trim() } : {}),

  location: basics.location,
  description: basics.description,

  spotsAvailable: basics.spotsAvailable,

  startDate: basics.startDate,
  endDate: basics.endDate,
  ...(basics.dateDisplayText?.trim() && {
    dateDisplayText: basics.dateDisplayText.trim(),
  }),

  media,
  faqs,

  pricing,
});

export interface Step4PricingProps {
  onSubmit: (payload: CreateEventPayload) => void;
  submitLabel: string;
  submitLoadingLabel: string;
  isSubmitting: boolean;
}

const Step4Pricing = ({
  onSubmit,
  submitLabel,
  submitLoadingLabel,
  isSubmitting,
}: Step4PricingProps) => {
  const { basics, media, faqs, pricing, setPricing, prevStep } =
    useEventFormStore();

  const handleSubmit = () => {
    if (typeof pricing.price !== "number" || pricing.price < 0) {
      toast.error("Please enter a valid price (0 or more).");
      return;
    }

    const payload = buildEventCreatePayload(basics, media, faqs, pricing);
    onSubmit(payload);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.valueAsNumber;
    setPricing({ price: Number.isFinite(v) ? v : 0 });
  };

  return (
    <div className="space-y-6">
      <FieldGroup className="gap-4">
        <FieldLabel>Pricing</FieldLabel>

        <p className="text-muted-foreground text-sm">
          Set the price for this event. Currency is fixed to INR for now.
        </p>

        <Field>
          <FieldLabel htmlFor="event-price">
            Price <RequiredMark />
          </FieldLabel>

          <Input
            id="event-price"
            type="number"
            min={0}
            step={1}
            placeholder="0"
            value={pricing.price === 0 ? "" : pricing.price}
            onChange={handlePriceChange}
            disabled={isSubmitting}
          />
        </Field>

        <p className="text-muted-foreground text-sm">Currency: INR</p>
      </FieldGroup>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isSubmitting}
        >
          Back
        </Button>

        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? submitLoadingLabel : submitLabel}
        </Button>
      </div>
    </div>
  );
};

export default Step4Pricing;
