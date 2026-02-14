"use client";

import toast from "react-hot-toast";

import RequiredMark from "@/components/custom/required-mark";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

import CustomQuestionsSection from "./CustomQuestionsSection";

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
  isFreeRsvp: basics.isFreeRsvp ?? false,
  customQuestions:
    customQuestions.length > 0
      ? customQuestions.map((q) => {
          const type = q.type ?? "string";
          return {
            label: q.label,
            required: q.required,
            type,
            ...(type === "dropDown" && q.options?.length
              ? {
                  options: q.options.map((o) => o.trim()).filter(Boolean),
                }
              : {}),
          };
        })
      : undefined,
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
    setBasics,
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

    const hasInvalidDropdown = customQuestions.some(
      (q) =>
        (q.type ?? "string") === "dropDown" &&
        (!q.options?.length || !q.options.some((o) => o.trim())),
    );

    if (hasInvalidDropdown) {
      toast.error(
        "Dropdown questions must have at least one option with text.",
      );
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
        <div className="border-border flex items-center justify-between gap-4 rounded-lg border p-4">
          <FieldLabel className="text-muted-foreground font-normal">
            Free RSVP — no payment required; guests reserve a spot and go
            straight to confirmation.
          </FieldLabel>

          <Switch
            checked={basics.isFreeRsvp ?? false}
            onCheckedChange={(checked) =>
              setBasics({ isFreeRsvp: checked === true })
            }
            disabled={isSubmitting}
          />
        </div>
      </FieldGroup>

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

      <CustomQuestionsSection
        customQuestions={customQuestions}
        setCustomQuestions={setCustomQuestions}
        isSubmitting={isSubmitting}
      />

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
