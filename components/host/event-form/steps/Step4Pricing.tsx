"use client";

import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import RequiredMark from "@/components/custom/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEventFormStore } from "@/store/event-form-store";
import type {
  CreateEventPayload,
  EventFormBasics,
  EventQuestion,
  EventTicket,
  ExperienceFAQ,
  MediaItem,
} from "@/types";

/** Slugify label for ticket code: lowercase, hyphens, alphanumeric only. */
function slugifyCode(label: string): string {
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "ticket"
  );
}

/** Ensure code is unique among existing tickets; append -1, -2 if needed. */
function ensureUniqueCode(
  existingTickets: EventTicket[],
  label: string,
  excludeIndex: number,
): string {
  const base = slugifyCode(label);

  const used = new Set(
    existingTickets.filter((_, i) => i !== excludeIndex).map((t) => t.code),
  );
  if (!used.has(base)) return base;

  let n = 1;
  while (used.has(`${base}-${n}`)) n += 1;

  return `${base}-${n}`;
}

export const buildEventCreatePayload = (
  basics: EventFormBasics,
  media: MediaItem[],
  faqs: ExperienceFAQ[],
  tickets: EventTicket[],
  customQuestions: EventQuestion[],
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

  tickets,
  customQuestions: customQuestions.length > 0 ? customQuestions : undefined,
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
  const {
    basics,
    media,
    faqs,
    tickets,
    customQuestions,
    setTickets,
    setCustomQuestions,
    prevStep,
  } = useEventFormStore();

  const updateTicket = (index: number, updates: Partial<EventTicket>) => {
    setTickets(
      tickets.map((t, i) => {
        if (i !== index) return t;
        const next = { ...t, ...updates };

        if (updates.label !== undefined) {
          next.code = ensureUniqueCode(tickets, updates.label, index);
        }

        return next;
      }),
    );
  };

  const addTicket = () => {
    const base = "New ticket";
    const code = ensureUniqueCode(tickets, base, tickets.length);
    setTickets([...tickets, { code, label: base, price: 0, currency: "INR" }]);
  };

  const removeTicket = (index: number) => {
    if (tickets.length <= 1) {
      toast.error("At least one ticket type is required.");
      return;
    }

    setTickets(tickets.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    setCustomQuestions([...customQuestions, { label: "", required: false }]);
  };

  const updateQuestion = (index: number, updates: Partial<EventQuestion>) => {
    setCustomQuestions(
      customQuestions.map((q, i) => (i === index ? { ...q, ...updates } : q)),
    );
  };

  const removeQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const hasInvalidTicket = tickets.some(
      (t) => !t.label.trim() || typeof t.price !== "number" || t.price < 0,
    );

    if (hasInvalidTicket) {
      toast.error("Each ticket needs a label and a valid price (≥ 0).");
      return;
    }

    const hasInvalidQuestion = customQuestions.some((q) => !q.label.trim());
    if (hasInvalidQuestion) {
      toast.error("Custom questions must have a label or be removed.");
      return;
    }

    const payload = buildEventCreatePayload(
      basics,
      media,
      faqs,
      tickets,
      customQuestions,
    );

    onSubmit(payload);
  };

  return (
    <div className="space-y-8">
      <FieldGroup className="gap-4">
        <FieldLabel>Tickets</FieldLabel>

        <p className="text-muted-foreground text-sm">
          Add at least one ticket type (e.g. Standard, Premium). Currency is
          INR.
        </p>

        <ul className="flex flex-col gap-4">
          {tickets.map((ticket, index) => (
            <li
              key={`ticket-${index}`}
              className="border-border bg-card rounded-lg border p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted-foreground text-sm font-medium">
                  Ticket {index + 1}
                </span>

                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeTicket(index)}
                  disabled={tickets.length <= 1}
                >
                  Remove
                </Button>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`ticket-label-${index}`}>
                    Label <RequiredMark />
                  </FieldLabel>

                  <Input
                    id={`ticket-label-${index}`}
                    type="text"
                    placeholder="e.g. Standard"
                    value={ticket.label}
                    onChange={(e) =>
                      updateTicket(index, { label: e.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor={`ticket-price-${index}`}>
                    Price (₹) <RequiredMark />
                  </FieldLabel>

                  <Input
                    id={`ticket-price-${index}`}
                    type="number"
                    min={0}
                    step={1}
                    placeholder="0"
                    value={ticket.price === 0 ? "" : ticket.price}
                    onChange={(e) => {
                      const v = e.target.valueAsNumber;
                      updateTicket(index, {
                        price: Number.isFinite(v) ? v : 0,
                      });
                    }}
                    disabled={isSubmitting}
                  />
                </Field>
              </div>

              <Field className="mt-3">
                <FieldLabel htmlFor={`ticket-description-${index}`}>
                  Description (optional)
                </FieldLabel>
                <Textarea
                  id={`ticket-description-${index}`}
                  placeholder="e.g. Includes entry, welcome drink, and goodie bag"
                  value={ticket.description ?? ""}
                  onChange={(e) =>
                    updateTicket(index, {
                      description: e.target.value || undefined,
                    })
                  }
                  disabled={isSubmitting}
                  rows={3}
                  className="min-h-[80px] resize-y"
                />
              </Field>
            </li>
          ))}
        </ul>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTicket}
          disabled={isSubmitting}
        >
          Add ticket type
        </Button>
      </FieldGroup>

      <FieldGroup className="gap-4">
        <FieldLabel>Custom questions (optional)</FieldLabel>

        <p className="text-muted-foreground text-sm">
          Extra questions for each attendee at checkout (e.g. &quot;Are you
          above 18?&quot;). Fixed fields (name, email, phone, Instagram) are
          always collected.
        </p>

        {customQuestions.length > 0 && (
          <ul className="flex flex-col gap-3">
            {customQuestions.map((q, index) => (
              <li
                key={index}
                className="border-border bg-card flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:flex-wrap md:items-center md:gap-2"
              >
                <Input
                  className="w-full min-w-0 md:min-w-[140px] md:flex-1"
                  placeholder="Question label"
                  value={q.label}
                  onChange={(e) =>
                    updateQuestion(index, { label: e.target.value })
                  }
                  disabled={isSubmitting}
                />

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) =>
                        updateQuestion(index, {
                          required: e.target.checked,
                        })
                      }
                      disabled={isSubmitting}
                      className="border-border rounded"
                    />
                    Required
                  </label>

                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeQuestion(index)}
                    disabled={isSubmitting}
                    aria-label="Remove question"
                  >
                    <Trash2 className="size-4" />
                    <span className="ml-1.5 md:hidden">Remove</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addQuestion}
          disabled={isSubmitting}
        >
          Add custom question
        </Button>
      </FieldGroup>

      <div className="flex justify-end gap-3 pt-2">
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
