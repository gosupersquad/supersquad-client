"use client";

import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEventFormStore } from "@/store/event-form-store";
import type { ExperienceFAQ } from "@/types";

const Step3Faqs = () => {
  const { faqs, setFaqs, nextStep, prevStep } = useEventFormStore();

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

  const handleNext = () => {
    if (faqs.length > 0) {
      const incomplete = faqs.some(
        (f) => !f.question.trim() || !f.answer.trim(),
      );

      if (incomplete)
        return toast.error("Please fill question and answer for each FAQ.");
    }

    nextStep();
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
    <li className="rounded-lg border border-border bg-card p-4">
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

export default Step3Faqs;
