"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import DiscountCodeDraftModal from "@/components/host/discount-code-form/DiscountCodeDraftModal";
import DiscountCodeFormModal from "@/components/host/DiscountCodeFormModal";
import DiscountCodesCards from "@/components/host/DiscountCodesCards";
import DiscountCodesTable from "@/components/host/DiscountCodesTable";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteDiscountCode,
  listDiscountCodes,
  toggleDiscountCodeStatus,
  type DiscountCodeResponse,
} from "@/lib/discount-codes-client";
import { useAuthStore } from "@/store/auth-store";
import { useEventFormStore } from "@/store/event-form-store";
import type {
  CreateEventDiscountCodeItem,
  CreateEventPayload,
  ExperienceFAQ,
} from "@/types";

import { EventFormMode } from "../EventFormBase";
import CustomQuestionsSection from "./CustomQuestionsSection";
import { buildEventCreatePayload } from "./Step3Pricing";

const COUPONS_QUERY_KEY = ["discount-codes", "by-event"];

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
    setDiscountCodeDrafts,
    prevStep,
  } = useEventFormStore();

  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingDraftIndex, setEditingDraftIndex] = useState<number | null>(
    null,
  );

  const [editingApi, setEditingApi] = useState<DiscountCodeResponse | null>(
    null,
  );

  const isCreate = mode === "create";

  const { data: eventCoupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: [...COUPONS_QUERY_KEY, eventId],
    queryFn: () => {
      const t = useAuthStore.getState().token;
      if (!t || !eventId) throw new Error("Not signed in or missing event");
      return listDiscountCodes(t, eventId);
    },
    enabled: !isCreate && !!eventId && !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDiscountCode(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      toast.success("Discount code deleted");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => toggleDiscountCodeStatus(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      toast.success("Status updated");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    },
  });

  const handleDraftSubmit = (
    item: CreateEventDiscountCodeItem,
    editIndex?: number,
  ) => {
    if (editIndex != null) {
      setDiscountCodeDrafts(
        discountCodeDrafts.map((d, i) => (i === editIndex ? item : d)),
      );
    } else {
      setDiscountCodeDrafts([...discountCodeDrafts, item]);
    }
    setEditingDraftIndex(null);
  };

  const openAddDraft = () => {
    setEditingDraftIndex(null);
    setEditingApi(null);
    setCouponModalOpen(true);
  };

  const openEditDraft = (index: number) => {
    setEditingDraftIndex(index);
    setEditingApi(null);
    setCouponModalOpen(true);
  };

  const removeDraft = (index: number) => {
    setDiscountCodeDrafts(discountCodeDrafts.filter((_, i) => i !== index));
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
    setEditingApi(null);
  };

  const closeCouponModal = (open: boolean) => {
    setCouponModalOpen(open);
    if (!open) {
      setEditingApi(null);
      setEditingDraftIndex(null);
    }
  };

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

      <FieldGroup className="gap-4">
        <FieldLabel>Coupons</FieldLabel>
        <p className="text-muted-foreground text-sm">
          {isCreate
            ? "Add discount codes to create with this event. You can also add more later from Discount codes."
            : "Manage discount codes for this event. Add, edit, or remove."}
        </p>

        {isCreate ? (
          <>
            {discountCodeDrafts.length > 0 && (
              <ul className="border-border divide-border divide-y rounded-lg border">
                {discountCodeDrafts.map((draft, index) => (
                  <li
                    key={`${draft.code}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                  >
                    <span className="font-medium">{draft.code}</span>

                    <span className="text-muted-foreground text-sm">
                      {draft.type === "percentage"
                        ? `${draft.amount}% off`
                        : `₹${draft.amount} off`}
                    </span>

                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDraft(index)}
                      >
                        <Pencil className="size-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => removeDraft(index)}
                      >
                        <Trash2 className="size-4" />
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
              onClick={openAddDraft}
            >
              <Plus className="mr-2 size-4" />
              Add coupon
            </Button>

            <DiscountCodeDraftModal
              open={couponModalOpen}
              onOpenChange={closeCouponModal}
              editingDraft={
                editingDraftIndex != null
                  ? (discountCodeDrafts[editingDraftIndex] ?? null)
                  : null
              }
              editingDraftIndex={editingDraftIndex}
              onDraftSubmit={handleDraftSubmit}
            />
          </>
        ) : (
          <>
            {loadingCoupons ? (
              <div className="text-muted-foreground flex items-center gap-2 py-4">
                <Loader2 className="size-4 animate-spin" />
                <span>Loading coupons…</span>
              </div>
            ) : eventCoupons.length === 0 ? (
              <p className="text-muted-foreground py-2 text-sm">
                No coupons for this event yet.
              </p>
            ) : (
              <>
                <div className="md:hidden">
                  <DiscountCodesCards
                    codes={eventCoupons}
                    onEdit={(item) => {
                      setEditingApi(item);
                      setCouponModalOpen(true);
                    }}
                    onDelete={(item) => {
                      if (
                        window.confirm(
                          `Delete "${item.code}"? This cannot be undone.`,
                        )
                      )
                        deleteMutation.mutate(item._id);
                    }}
                    isDeletingId={
                      deleteMutation.isPending &&
                      deleteMutation.variables != null
                        ? (deleteMutation.variables as string)
                        : null
                    }
                  />
                </div>

                <div className="hidden md:block">
                  <DiscountCodesTable
                    codes={eventCoupons}
                    onToggleStatus={(id) => toggleMutation.mutate(id)}
                    onEdit={(item) => {
                      setEditingApi(item);
                      setCouponModalOpen(true);
                    }}
                    onDelete={(item) => {
                      if (
                        window.confirm(
                          `Delete "${item.code}"? This cannot be undone.`,
                        )
                      )
                        deleteMutation.mutate(item._id);
                    }}
                    isTogglingId={
                      toggleMutation.isPending &&
                      toggleMutation.variables != null
                        ? (toggleMutation.variables as string)
                        : null
                    }
                    isDeletingId={
                      deleteMutation.isPending &&
                      deleteMutation.variables != null
                        ? (deleteMutation.variables as string)
                        : null
                    }
                  />
                </div>
              </>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingApi(null);
                setCouponModalOpen(true);
              }}
            >
              <Plus className="mr-2 size-4" />
              Add coupon
            </Button>

            {token && (
              <DiscountCodeFormModal
                open={couponModalOpen}
                onOpenChange={closeCouponModal}
                editing={editingApi}
                token={token}
                onSuccess={handleModalSuccess}
                experienceId={eventId}
              />
            )}
          </>
        )}
      </FieldGroup>

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
