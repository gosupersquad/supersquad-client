"use client";

import toast from "react-hot-toast";

import RequiredMark from "@/components/custom/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useEventFormStore } from "@/store/event-form-store";

const Step4Pricing = () => {
  const { pricing, setPricing, nextStep, prevStep } = useEventFormStore();

  const handleNext = () => {
    const price = pricing.price;

    if (typeof price !== "number" || price < 0) {
      return toast.error("Please enter a valid price (0 or more).");
    }

    nextStep();
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
          />
        </Field>

        <p className="text-muted-foreground text-sm">Currency: INR</p>
      </FieldGroup>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>

        <Button type="button" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step4Pricing;
