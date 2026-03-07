"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import type { Resolver } from "react-hook-form";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { DiscountType } from "@/lib/discount-codes-client";

/** Form values for create/edit discount code. Maps to API payload and draft item. */
export interface DiscountCodeFormValues {
  code: string;
  type: DiscountType;
  amount: number;
  currency: "INR";
  maxUsage?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  isPublic: boolean;
}

export const emptyFormValues: DiscountCodeFormValues = {
  code: "",
  type: "flat",
  amount: 0,
  currency: "INR",
  isActive: true,
  isPublic: true,
};

const discountCodeFormSchema = z
  .object({
    code: z.string().min(1, "Code is required"),
    type: z.enum(["flat", "percentage"]),
    amount: z.string().min(1, "Amount is required"),
    maxUsage: z.string().optional(),
    startsAt: z.string().optional(),
    expiresAt: z.string().optional(),
    isActive: z.boolean(),
    isPublic: z.boolean(),
  })
  .refine(
    (data) => {
      const n = Number(data.amount);
      return !Number.isNaN(n) && n >= 0;
    },
    { message: "Amount must be a positive number", path: ["amount"] },
  )
  .refine(
    (data) => {
      if (data.type !== "percentage") return true;
      const n = Number(data.amount);
      return !Number.isNaN(n) && n <= 100;
    },
    { message: "Percentage must be between 0 and 100", path: ["amount"] },
  )
  .refine(
    (data) => {
      if (!data.startsAt || !data.expiresAt) return true;
      return new Date(data.expiresAt) > new Date(data.startsAt);
    },
    { message: "End date must be after start date", path: ["expiresAt"] },
  );

type FormValues = z.infer<typeof discountCodeFormSchema>;

function toFormDefaultValues(v: DiscountCodeFormValues): FormValues {
  return {
    code: v.code,
    type: v.type,
    amount: v.amount === 0 ? "" : String(v.amount),
    maxUsage: v.maxUsage != null ? String(v.maxUsage) : "",
    startsAt: v.startsAt ?? "",
    expiresAt: v.expiresAt ?? "",
    isActive: v.isActive,
    isPublic: v.isPublic,
  };
}

function formValuesToSubmit(
  data: FormValues,
  mode: "create" | "edit",
  codeEdit: string,
): DiscountCodeFormValues {
  const amountNum = Number(data.amount);

  const values: DiscountCodeFormValues = {
    code: mode === "edit" ? codeEdit : data.code.trim().toUpperCase(),
    type: data.type,
    amount: amountNum,
    currency: "INR",
    isActive: data.isActive,
    isPublic: data.isPublic,
  };

  const maxUsageStr = data.maxUsage?.trim() ?? "";

  if (maxUsageStr !== "") {
    const max = parseInt(maxUsageStr, 10);
    if (!Number.isNaN(max) && max >= 0) values.maxUsage = max;
  }

  if (data.startsAt?.trim()) values.startsAt = data.startsAt.trim();
  if (data.expiresAt?.trim()) values.expiresAt = data.expiresAt.trim();

  return values;
}

export interface DiscountCodeFormBaseProps {
  mode: "create" | "edit";
  defaultValues: DiscountCodeFormValues;
  onSubmit: (values: DiscountCodeFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  submitLoadingLabel?: string;
  cancelLabel?: string;
}

const DiscountCodeFormBase = ({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = mode === "edit" ? "Update" : "Create",
  submitLoadingLabel = mode === "edit" ? "Updating…" : "Creating…",
  cancelLabel = "Cancel",
}: DiscountCodeFormBaseProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(discountCodeFormSchema) as Resolver<FormValues>,
    defaultValues: toFormDefaultValues(defaultValues),
  });

  const type = useWatch({
    control: form.control,
    name: "type",
    defaultValue: "flat",
  });

  useEffect(() => {
    form.reset(toFormDefaultValues(defaultValues));
  }, [defaultValues, form]);

  const handleSubmit = form.handleSubmit((data) => {
    const payload = formValuesToSubmit(data, mode, defaultValues.code);
    void Promise.resolve(onSubmit(payload));
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Controller
          name="code"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="dc-code">Code</FieldLabel>

              <Input
                {...field}
                id="dc-code"
                placeholder="e.g. SAVE20"
                disabled={mode === "edit"}
                className={mode === "edit" ? "bg-muted" : ""}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="dc-type">Discount type</FieldLabel>

              <select
                id="dc-type"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value as DiscountType)}
                onBlur={field.onBlur}
                disabled={mode === "edit"}
                className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-invalid={fieldState.invalid}
              >
                <option value="flat">Flat (₹ off)</option>
                <option value="percentage">Percentage (% off)</option>
              </select>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="dc-amount">
                {type === "percentage" ? "Percentage (%)" : "Amount (₹)"}
              </FieldLabel>

              <Input
                {...field}
                id="dc-amount"
                type="number"
                min={0}
                max={type === "percentage" ? 100 : undefined}
                step={type === "percentage" ? 1 : 0.1}
                placeholder={type === "percentage" ? "10" : "100"}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="maxUsage"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="dc-maxUsage">
                Max usage (optional)
              </FieldLabel>

              <Input
                {...field}
                id="dc-maxUsage"
                type="number"
                min={0}
                placeholder="Unlimited if empty"
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="startsAt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="dc-startsAt">
                  Start date (optional)
                </FieldLabel>

                <Input
                  {...field}
                  id="dc-startsAt"
                  type="date"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="expiresAt"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="dc-expiresAt">
                  End date (optional)
                </FieldLabel>

                <Input
                  {...field}
                  id="dc-expiresAt"
                  type="date"
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-center gap-2">
              <Switch
                id="dc-isActive"
                checked={field.value}
                onCheckedChange={field.onChange}
              />

              <Label htmlFor="dc-isActive" className="font-normal">
                Active
              </Label>
            </Field>
          )}
        />

        <Controller
          name="isPublic"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-center gap-2">
              <Switch
                id="dc-isPublic"
                checked={field.value}
                onCheckedChange={field.onChange}
              />

              <Label htmlFor="dc-isPublic" className="font-normal">
                Show in checkout offers (uncheck for private code)
              </Label>
            </Field>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? submitLoadingLabel : submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
};

export default DiscountCodeFormBase;
