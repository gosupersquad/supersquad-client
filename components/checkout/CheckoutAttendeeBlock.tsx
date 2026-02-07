"use client";

import { ChevronDown } from "lucide-react";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { EventQuestion } from "@/types";

export interface AttendeeFormData {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  customAnswers: Record<string, string>;
}

interface CheckoutAttendeeBlockProps {
  index: number;
  ticketLabel: string;
  customQuestions: EventQuestion[];
  data: AttendeeFormData;
  onChange: (data: AttendeeFormData) => void;
}

const CheckoutAttendeeBlock = ({
  index,
  ticketLabel,
  customQuestions,
  data,
  onChange,
}: CheckoutAttendeeBlockProps) => {
  const update = (updates: Partial<AttendeeFormData>) => {
    onChange({ ...data, ...updates });
  };

  return (
    <div className="border-border bg-card space-y-4 rounded-xl border p-4">
      <h3 className="text-foreground text-lg font-semibold">
        Attendee {index + 1} ({ticketLabel})
      </h3>

      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel htmlFor={`attendee-${index}-name`}>Name</FieldLabel>

          <Input
            id={`attendee-${index}-name`}
            type="text"
            placeholder="What's your name"
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={`attendee-${index}-email`}>
            Email address
          </FieldLabel>

          <Input
            id={`attendee-${index}-email`}
            type="email"
            placeholder="eg: john@gmail.com"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={`attendee-${index}-phone`}>
            Phone number
          </FieldLabel>

          <div className="border-input bg-background flex items-center gap-2 rounded-md border shadow-xs">
            <div className="text-muted-foreground border-border flex items-center gap-1.5 border-r px-3 py-2">
              <span className="text-lg">🇮🇳</span>
              <span className="text-sm">+91</span>

              <ChevronDown className="size-4 opacity-50" aria-hidden />
            </div>

            <Input
              id={`attendee-${index}-phone`}
              type="tel"
              placeholder="Phone number"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              value={data.phone}
              onChange={(e) => update({ phone: e.target.value })}
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor={`attendee-${index}-instagram`}>
            Instagram Handle
          </FieldLabel>

          <Input
            id={`attendee-${index}-instagram`}
            type="text"
            placeholder="eg. @johndoe22"
            value={data.instagram}
            onChange={(e) => update({ instagram: e.target.value })}
          />
        </Field>

        {customQuestions.map((q) => (
          <Field key={q.label}>
            <FieldLabel htmlFor={`attendee-${index}-q-${q.label}`}>
              {q.label}
              {q.required && <span className="text-destructive ml-0.5">*</span>}
            </FieldLabel>

            <Input
              id={`attendee-${index}-q-${q.label}`}
              type="text"
              value={data.customAnswers[q.label] ?? ""}
              onChange={(e) =>
                update({
                  customAnswers: {
                    ...data.customAnswers,
                    [q.label]: e.target.value,
                  },
                })
              }
            />
          </Field>
        ))}
      </FieldGroup>
    </div>
  );
};

export default CheckoutAttendeeBlock;
