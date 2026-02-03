"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDays } from "date-fns";
import DatePicker from "react-datepicker";
import type { Resolver } from "react-hook-form";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import RequiredMark from "@/components/custom/required-mark";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDateToISO, parseISOToDate, startOfToday } from "@/lib/utils";
import { useEventFormStore } from "@/store/event-form-store";

import "react-datepicker/dist/react-datepicker.css";

const step1Schema = z
  .object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().optional(),
    location: z.string().min(1, "Location is required"),
    description: z.string().min(1, "Description is required"),
    spotsAvailable: z.coerce.number().int().min(0, "Must be 0 or more"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    dateDisplayText: z.string().optional(),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      const start = parseISOToDate(data.startDate);
      return start !== null && start >= startOfToday();
    },
    {
      message: "Start date cannot be in the past",
      path: ["startDate"],
    },
  )
  .refine(
    (data) => {
      const start = parseISOToDate(data.startDate);
      const end = parseISOToDate(data.endDate);
      return start !== null && end !== null && end > start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

type Step1Values = z.infer<typeof step1Schema>;

const Step1Basics = () => {
  const { basics, setBasics, nextStep, prevStep, step } = useEventFormStore();
  const isFirstStep = step === 1;

  const form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema) as Resolver<Step1Values>,
    defaultValues: {
      title: basics.title,
      slug: basics.slug,
      location: basics.location,
      description: basics.description,
      spotsAvailable: basics.spotsAvailable,
      startDate: basics.startDate,
      endDate: basics.endDate,
      dateDisplayText: basics.dateDisplayText,
      isActive: basics.isActive,
    },
  });

  const startDate = useWatch({
    control: form.control,
    name: "startDate",
    defaultValue: "",
  });

  const onSubmit = (data: Step1Values) => {
    setBasics({
      title: data.title,
      slug: data.slug ?? "",
      location: data.location,
      description: data.description,
      spotsAvailable: data.spotsAvailable,
      startDate: data.startDate,
      endDate: data.endDate,
      dateDisplayText: data.dateDisplayText ?? "",
      isActive: data.isActive,
    });
    nextStep();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="event-title">
                Title <RequiredMark />
              </FieldLabel>

              <Input
                {...field}
                id="event-title"
                placeholder="e.g. Padel Social"
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="event-slug">Slug (optional)</FieldLabel>

              <Input
                {...field}
                id="event-slug"
                placeholder="Auto-generated from title if empty"
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="location"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="event-location">
                Location <RequiredMark />
              </FieldLabel>

              <Input
                {...field}
                id="event-location"
                placeholder="e.g. Mumbai"
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="event-description">
                Description <RequiredMark />
              </FieldLabel>

              <Textarea
                {...field}
                id="event-description"
                placeholder="Describe your event"
                rows={4}
                className="min-h-[100px] resize-y"
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="spotsAvailable"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="event-spots">
                Spots available <RequiredMark />
              </FieldLabel>

              <Input
                {...field}
                id="event-spots"
                type="number"
                min={0}
                placeholder="0"
                value={field.value === 0 ? "" : field.value}
                onChange={(e) => {
                  const v = e.target.valueAsNumber;
                  field.onChange(Number.isFinite(v) ? v : 0);
                }}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="event-start">
                  Start date <RequiredMark />
                </FieldLabel>

                <DatePicker
                  id="event-start"
                  selected={field.value ? parseISOToDate(field.value) : null}
                  onChange={(date: Date | null) =>
                    field.onChange(date ? formatDateToISO(date) : "")
                  }
                  minDate={startOfToday()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  aria-invalid={fieldState.invalid ? "true" : "false"}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="endDate"
            control={form.control}
            render={({ field, fieldState }) => {
              const startParsed = startDate ? parseISOToDate(startDate) : null;
              const minEnd = startParsed
                ? addDays(startParsed, 1)
                : startOfToday();
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="event-end">
                    End date <RequiredMark />
                  </FieldLabel>

                  <DatePicker
                    id="event-end"
                    selected={field.value ? parseISOToDate(field.value) : null}
                    onChange={(date: Date | null) =>
                      field.onChange(date ? formatDateToISO(date) : "")
                    }
                    minDate={minEnd}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    aria-invalid={fieldState.invalid ? "true" : "false"}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />
        </div>

        <Controller
          name="dateDisplayText"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="event-date-display">
                Date display text (optional)
              </FieldLabel>

              <Input
                {...field}
                id="event-date-display"
                placeholder="e.g. March 15–17, 2026"
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-center gap-2">
              <input
                type="checkbox"
                id="event-active"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="size-4 rounded border-border"
              />

              <FieldLabel htmlFor="event-active" className="font-normal">
                Active (show on listing)
              </FieldLabel>
            </Field>
          )}
        />

        <div className="flex gap-3 pt-2">
          {!isFirstStep && (
            <Button type="button" variant="outline" onClick={prevStep}>
              Back
            </Button>
          )}

          <Button type="submit">Next</Button>
        </div>
      </FieldGroup>
    </form>
  );
};

export default Step1Basics;
