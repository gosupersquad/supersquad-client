"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createDiscountCode,
  updateDiscountCode,
  type CreateDiscountCodePayload,
  type DiscountCodeResponse,
  type UpdateDiscountCodePayload,
} from "@/lib/discount-codes-client";
import { cn } from "@/lib/utils";

import DiscountCodeFormBase, {
  emptyFormValues,
  type DiscountCodeFormValues,
} from "./discount-code-form/DiscountCodeFormBase";

function apiItemToFormValues(d: DiscountCodeResponse): DiscountCodeFormValues {
  return {
    code: d.code,
    type: d.type,
    amount: d.amount,
    currency: "INR",
    maxUsage: d.maxUsage,
    startsAt: d.startsAt,
    expiresAt: d.expiresAt,
    isActive: d.isActive,
    isPublic: d.isPublic ?? true,
  };
}

export interface DiscountCodeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: DiscountCodeResponse | null;
  token: string;
  onSuccess: () => void;
  /** When creating, link the code to this event. */
  experienceId?: string;
}

const DiscountCodeFormModal = ({
  open,
  onOpenChange,
  editing,
  token,
  onSuccess,
  experienceId,
}: DiscountCodeFormModalProps) => {
  const isEdit = !!editing;
  const defaultValues = useMemo<DiscountCodeFormValues>(
    () => (editing ? apiItemToFormValues(editing) : emptyFormValues),
    [editing],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: DiscountCodeFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEdit && editing) {
        const payload: UpdateDiscountCodePayload = {
          type: values.type,
          amount: values.amount,
          isActive: values.isActive,
          isPublic: values.isPublic,
        };
        if (values.maxUsage != null) payload.maxUsage = values.maxUsage;
        if (values.startsAt) payload.startsAt = values.startsAt;
        if (values.expiresAt) payload.expiresAt = values.expiresAt;

        await updateDiscountCode(editing._id, payload, token);
        toast.success("Discount code updated");
      } else {
        const payload: CreateDiscountCodePayload = {
          code: values.code,
          type: values.type,
          amount: values.amount,
          currency: "INR",
          isActive: values.isActive,
          isPublic: values.isPublic,
        };
        if (values.maxUsage != null) payload.maxUsage = values.maxUsage;
        if (values.startsAt) payload.startsAt = values.startsAt;
        if (values.expiresAt) payload.expiresAt = values.expiresAt;
        if (experienceId) payload.experienceId = experienceId;

        await createDiscountCode(payload, token);
        toast.success("Discount code created");
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "bg-background fixed inset-0 z-50 flex h-full w-full max-w-none translate-x-0 translate-y-0 flex-col gap-4 rounded-none border-0 p-6 md:inset-auto md:top-1/2 md:left-1/2 md:h-auto md:max-h-[90vh] md:w-full md:max-w-lg md:translate-x-[-50%] md:translate-y-[-50%] md:rounded-lg md:border md:shadow-lg",
        )}
      >
        <DialogHeader>
          <DialogTitle className="mt-4 text-2xl font-semibold md:mt-0">
            {isEdit ? "Edit discount code" : "Create discount code"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update the discount code details. Code cannot be changed."
              : "Create a new discount code for your events."}
          </DialogDescription>
        </DialogHeader>

        <DiscountCodeFormBase
          key={open ? (editing?._id ?? "create") : "closed"}
          mode={isEdit ? "edit" : "create"}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitLabel={isEdit ? "Update" : "Create"}
          submitLoadingLabel={isEdit ? "Updating…" : "Creating…"}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DiscountCodeFormModal;
