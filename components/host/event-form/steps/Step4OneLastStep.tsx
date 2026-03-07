"use client";

import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEventFormStore } from "@/store/event-form-store";
import type { CreateEventPayload, ExperienceFAQ } from "@/types";

import { EventFormMode } from "../EventFormBase";
import CustomQuestionsSection from "./CustomQuestionsSection";
import { buildEventCreatePayload } from "./Step3Pricing";
import Step4CouponsSection from "./Step4CouponsSection";

/** Step 4 – One last step: FAQs + custom questions + Coupons. Back + Submit. */
export interface Step4OneLastStepProps {
  mode: EventFormMode;
  eventId?: string;
  onSubmit: (payload: CreateEventPayload) => void;
  submitLabel: string;
  submitLoadingLabel: string;
  isSubmitting: boolean;
}

const Step4OneLastStep = ({
  mode,
  eventId,
  onSubmit,
  submitLabel,
  submitLoadingLabel,
  isSubmitting,
}: Step4OneLastStepProps) => {
  const {
    basics,
    media,
    faqs,
    tickets,
    customQuestions,
    discountCodeDrafts,
    setFaqs,
    setCustomQuestions,
    prevStep,
  } = useEventFormStore();

  const isCreate = mode === "create";

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, updates: Partial<ExperienceFAQ>) => {
    setFaqs(
      faqs.map((item, i) => (i === index ? { ...item, ...updates } : item)),
    );
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (faqs.length > 0) {
      const incomplete = faqs.some(
        (f) => !f.question.trim() || !f.answer.trim(),
      );
      if (incomplete)
        return toast.error("Please fill question and answer for each FAQ.");
    }

    const hasInvalidTicket = tickets.some(
      (t) =>
        !t.label.trim() ||
        typeof t.price !== "number" ||
        t.price < 0 ||
        typeof t.totalSpots !== "number" ||
        t.totalSpots < 0 ||
        typeof t.spotsAvailable !== "number" ||
        t.spotsAvailable < 0 ||
        t.spotsAvailable > t.totalSpots,
    );

    if (hasInvalidTicket) {
      toast.error(
        "Each ticket needs a label, valid price (≥ 0), and spots (spots available ≤ total).",
      );
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

    if (
      basics.isFreeRsvp &&
      (basics.freeSpots == null || basics.freeSpots < 0)
    ) {
      toast.error("Free RSVP events need a spots value (≥ 0).");
      return;
    }

    const payload = buildEventCreatePayload(
      basics,
      media,
      faqs,
      tickets,
      customQuestions,
      discountCodeDrafts.length > 0 ? discountCodeDrafts : undefined,
    );
    onSubmit(payload);
  };

  return (
    <div className="space-y-6">
      <FieldGroup className="gap-4">
        <FieldLabel>FAQs</FieldLabel>

        <p className="text-muted-foreground text-sm">
          Add common questions and answers. You can skip this step or add none.
        </p>

        {faqs.length > 0 && (
          <ul className="flex flex-col gap-4">
            {faqs.map((item, index) => (
              <FaqRow
                key={index}
                index={index}
                question={item.question}
                answer={item.answer}
                onQuestionChange={(value) =>
                  updateFaq(index, { ...item, question: value })
                }
                onAnswerChange={(value) =>
                  updateFaq(index, { ...item, answer: value })
                }
                onRemove={() => removeFaq(index)}
              />
            ))}
          </ul>
        )}

        <Button type="button" variant="outline" size="sm" onClick={addFaq}>
          Add FAQ
        </Button>
      </FieldGroup>

      <CustomQuestionsSection
        customQuestions={customQuestions}
        setCustomQuestions={setCustomQuestions}
        isSubmitting={isSubmitting}
      />

      <Step4CouponsSection isCreate={isCreate} eventId={eventId} />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={prevStep}>
          Back
        </Button>

        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? submitLoadingLabel : submitLabel}
        </Button>
      </div>
    </div>
  );
};

const FaqRow = ({
  index,
  question,
  answer,
  onQuestionChange,
  onAnswerChange,
  onRemove,
}: {
  index: number;
  question: string;
  answer: string;
  onQuestionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onRemove: () => void;
}) => {
  return (
    <li className="border-border bg-card rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-muted-foreground text-sm font-medium">
          FAQ {index + 1}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <Field>
          <FieldLabel htmlFor={`faq-question-${index}`}>Question</FieldLabel>

          <Input
            id={`faq-question-${index}`}
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder="e.g. What should I bring?"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor={`faq-answer-${index}`}>Answer</FieldLabel>

          <Textarea
            id={`faq-answer-${index}`}
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="e.g. Comfortable clothes and water."
            rows={3}
            className="resize-y"
          />
        </Field>
      </div>
    </li>
  );
};

export default Step4OneLastStep;
