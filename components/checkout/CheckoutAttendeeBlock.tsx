"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import type { Path } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import RequiredMark from "@/components/custom/required-mark";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { EventQuestion } from "@/types";

export interface AttendeeFormData {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  customAnswers: Record<string, string>;
}

const CUSTOM_PREFIX = "q_";

function customKey(label: string) {
  return `${CUSTOM_PREFIX}${label.replace(/\s+/g, "_")}`;
}

/** Form values: fixed fields + one string field per custom question (q_Label). */
export interface AttendeeFormValues {
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  [key: string]: string | undefined;
}

function buildAttendeeSchema(customQuestions: EventQuestion[]) {
  const customEntries = customQuestions.map((q) => [
    customKey(q.label),
    q.required
      ? z.string().min(1, `${q.label} is required`)
      : z.string().optional(),
  ]);

  return z.object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phone: z.string().min(1, "Phone number is required"),
    instagram: z.string().optional(),
    ...Object.fromEntries(customEntries),
  });
}

function formValuesToData(
  values: AttendeeFormValues,
  customQuestions: EventQuestion[],
): AttendeeFormData {
  const customAnswers: Record<string, string> = {};

  customQuestions.forEach((q) => {
    const v = values[customKey(q.label)];
    customAnswers[q.label] = typeof v === "string" ? v : "";
  });

  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    instagram: values.instagram ?? "",
    customAnswers,
  };
}

export interface CheckoutAttendeeBlockHandle {
  validate: () => Promise<boolean>;
}

interface CheckoutAttendeeBlockProps {
  index: number;
  ticketLabel: string;
  customQuestions: EventQuestion[];
  data: AttendeeFormData;
  onChange: (data: AttendeeFormData) => void;
}

const CheckoutAttendeeBlock = forwardRef<
  CheckoutAttendeeBlockHandle,
  CheckoutAttendeeBlockProps
>(function CheckoutAttendeeBlock(
  { index, ticketLabel, customQuestions, data, onChange },
  ref,
) {
  const schema = useMemo(
    () => buildAttendeeSchema(customQuestions),
    [customQuestions],
  );

  const defaultValues = useMemo(() => {
    const vals: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      instagram: data.instagram,
    };

    customQuestions.forEach((q) => {
      vals[customKey(q.label)] = data.customAnswers?.[q.label] ?? "";
    });

    return vals as AttendeeFormValues;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- init from data once

  const form = useForm<AttendeeFormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues,
  });

  useImperativeHandle(
    ref,
    () => ({
      validate: () => form.trigger(),
    }),
    [form],
  );

  useEffect(() => {
    const sub = form.watch((values) => {
      onChange(formValuesToData(values as AttendeeFormValues, customQuestions));
    });

    return () => sub.unsubscribe();
  }, [form, onChange, customQuestions]);

  return (
    <div className="border-border bg-card space-y-4 rounded-xl border p-4">
      <h3 className="text-foreground text-lg font-semibold">
        Attendee {index + 1} ({ticketLabel})
      </h3>

      <FieldGroup className="gap-3">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`attendee-${index}-name`}>
                Name <RequiredMark />
              </FieldLabel>

              <Input
                {...field}
                id={`attendee-${index}-name`}
                type="text"
                placeholder="What's your name"
                value={field.value ?? ""}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`attendee-${index}-email`}>
                Email address <RequiredMark />
              </FieldLabel>

              <Input
                {...field}
                id={`attendee-${index}-email`}
                type="email"
                placeholder="eg: john@gmail.com"
                value={field.value ?? ""}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`attendee-${index}-phone`}>
                Phone number <RequiredMark />
              </FieldLabel>

              <div className="border-input bg-background flex items-center gap-2 rounded-md border shadow-xs">
                <div className="text-muted-foreground border-border flex items-center gap-1.5 border-r px-3 py-2">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-sm">+91</span>

                  <ChevronDown className="size-4 opacity-50" aria-hidden />
                </div>

                <Input
                  {...field}
                  id={`attendee-${index}-phone`}
                  type="tel"
                  placeholder="Phone number"
                  value={field.value ?? ""}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                  aria-invalid={fieldState.invalid}
                />
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="instagram"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={`attendee-${index}-instagram`}>
                Instagram Handle
              </FieldLabel>

              <Input
                {...field}
                id={`attendee-${index}-instagram`}
                type="text"
                placeholder="eg. @johndoe22"
                value={field.value ?? ""}
              />
            </Field>
          )}
        />

        {customQuestions.map((q) => (
          <Controller
            key={q.label}
            name={customKey(q.label) as Path<AttendeeFormValues>}
            control={form.control}
            render={({ field, fieldState }) => {
              const value = (field.value ?? "") as string;
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`attendee-${index}-q-${q.label}`}>
                    {q.label}
                    {q.required && <RequiredMark />}
                  </FieldLabel>

                  <Input
                    id={`attendee-${index}-q-${q.label}`}
                    type="text"
                    value={value}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />
        ))}
      </FieldGroup>
    </div>
  );
});

export default CheckoutAttendeeBlock;
