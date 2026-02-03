"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import RequiredMark from "@/components/custom/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createEvent } from "@/lib/experiences-client";
import { useAuthStore } from "@/store/auth-store";
import { useEventFormStore } from "@/store/event-form-store";
import type {
  CreateEventPayload,
  EventFormBasics,
  ExperienceFAQ,
  ExperiencePricing,
  MediaItem,
} from "@/types";

const buildEventCreatePayload = (
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

const Step4Pricing = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const token = useAuthStore((s) => s.token);
  const { basics, media, faqs, pricing, setPricing, prevStep, reset } =
    useEventFormStore();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not signed in");

      const payload = buildEventCreatePayload(basics, media, faqs, pricing);
      return createEvent(payload, token);
    },

    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      router.push("/host/experiences");
      toast.success("Event created");
    },

    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Failed to create event",
      );
    },
  });

  const handleCreate = () => {
    if (typeof pricing.price !== "number" || pricing.price < 0)
      return toast.error("Please enter a valid price (0 or more).");

    mutation.mutate();
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
            disabled={mutation.isPending}
          />
        </Field>

        <p className="text-muted-foreground text-sm">Currency: INR</p>
      </FieldGroup>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={mutation.isPending}
        >
          Back
        </Button>

        <Button
          type="button"
          onClick={handleCreate}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Creating…" : "Create event"}
        </Button>
      </div>
    </div>
  );
};

export default Step4Pricing;
