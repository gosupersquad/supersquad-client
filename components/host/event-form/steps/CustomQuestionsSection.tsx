"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { EventQuestion, EventQuestionType } from "@/types";
import { QUESTION_TYPES } from "@/types";

export interface CustomQuestionsSectionProps {
  customQuestions: EventQuestion[];
  setCustomQuestions: (questions: EventQuestion[]) => void;
  isSubmitting: boolean;
}

const CustomQuestionsSection = ({
  customQuestions,
  setCustomQuestions,
  isSubmitting,
}: CustomQuestionsSectionProps) => {
  const addQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      { label: "", required: false, type: "string" },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<EventQuestion>) => {
    setCustomQuestions(
      customQuestions.map((q, i) => {
        if (i !== index) return q;
        const next = { ...q, ...updates };

        if (updates.type === "string") next.options = undefined;
        if (updates.type === "dropDown" && !next.options?.length)
          next.options = [""];

        return next;
      }),
    );
  };

  const updateQuestionOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    const q = customQuestions[questionIndex];

    const options = [...(q.options ?? [])];
    options[optionIndex] = value;

    setCustomQuestions(
      customQuestions.map((qu, i) =>
        i === questionIndex ? { ...qu, options } : qu,
      ),
    );
  };

  const addQuestionOption = (questionIndex: number) => {
    const q = customQuestions[questionIndex];
    const options = [...(q.options ?? [""]), ""];

    setCustomQuestions(
      customQuestions.map((qu, i) =>
        i === questionIndex ? { ...qu, options } : qu,
      ),
    );
  };

  const removeQuestionOption = (questionIndex: number, optionIndex: number) => {
    const q = customQuestions[questionIndex];
    const options = (q.options ?? []).filter((_, i) => i !== optionIndex);

    setCustomQuestions(
      customQuestions.map((qu, i) =>
        i === questionIndex ? { ...qu, options } : qu,
      ),
    );
  };

  const removeQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  return (
    <FieldGroup className="gap-4">
      <FieldLabel>Custom questions (optional)</FieldLabel>

      <p className="text-muted-foreground text-sm">
        Extra questions for each attendee at checkout (e.g. &quot;Are you above
        18?&quot;). Fixed fields (name, email, phone, Instagram) are always
        collected.
      </p>

      {customQuestions.length > 0 && (
        <ul className="flex flex-col gap-3">
          {customQuestions.map((q, index) => (
            <li
              key={index}
              className="border-border bg-card flex flex-col gap-3 rounded-lg border p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                <Input
                  className="w-full min-w-0 sm:min-w-[140px] sm:flex-1"
                  placeholder="Question label"
                  value={q.label}
                  onChange={(e) =>
                    updateQuestion(index, { label: e.target.value })
                  }
                  disabled={isSubmitting}
                />

                <select
                  className="border-input bg-background flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm sm:w-auto"
                  value={q.type ?? "string"}
                  onChange={(e) =>
                    updateQuestion(index, {
                      type: e.target.value as EventQuestionType,
                    })
                  }
                  disabled={isSubmitting}
                  aria-label="Question type"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "string" ? "Text" : "Dropdown"}
                    </option>
                  ))}
                </select>

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
              </div>

              {(q.type ?? "string") === "dropDown" && (
                <div className="space-y-2">
                  <span className="text-muted-foreground text-sm">Options</span>

                  <ul className="flex flex-col gap-2">
                    {(q.options ?? []).map((opt, optIndex) => (
                      <li key={optIndex} className="flex items-center gap-2">
                        <Input
                          className="min-w-0 flex-1"
                          placeholder={`Option ${optIndex + 1}`}
                          value={opt}
                          onChange={(e) =>
                            updateQuestionOption(
                              index,
                              optIndex,
                              e.target.value,
                            )
                          }
                          disabled={isSubmitting}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                          onClick={() => removeQuestionOption(index, optIndex)}
                          disabled={
                            isSubmitting || (q.options ?? []).length <= 1
                          }
                          aria-label="Remove option"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => addQuestionOption(index)}
                    disabled={isSubmitting}
                  >
                    Add option
                  </Button>
                </div>
              )}
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
  );
};

export default CustomQuestionsSection;
