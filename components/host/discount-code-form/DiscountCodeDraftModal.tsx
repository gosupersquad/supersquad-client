"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CreateEventDiscountCodeItem } from "@/types";
import toast from "react-hot-toast";

import DiscountCodeFormBase, {
  emptyFormValues,
  type DiscountCodeFormValues,
} from "./DiscountCodeFormBase";

function draftToFormValues(
  d: CreateEventDiscountCodeItem,
): DiscountCodeFormValues {
  return {
    code: d.code,
    type: d.type,
    amount: d.amount,
    currency: d.currency ?? "INR",
    maxUsage: d.maxUsage,
    startsAt: d.startsAt,
    expiresAt: d.expiresAt,
    isActive: d.isActive ?? true,
    isPublic: d.isPublic ?? true,
  };
}

function formValuesToDraft(
  v: DiscountCodeFormValues,
): CreateEventDiscountCodeItem {
  const item: CreateEventDiscountCodeItem = {
    code: v.code,
    type: v.type,
    amount: v.amount,
    currency: "INR",
    isActive: v.isActive,
    isPublic: v.isPublic,
  };
  if (v.maxUsage != null) item.maxUsage = v.maxUsage;
  if (v.startsAt) item.startsAt = v.startsAt;
  if (v.expiresAt) item.expiresAt = v.expiresAt;
  return item;
}

export interface DiscountCodeDraftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, we're editing the draft at this index. */
  editingDraft: CreateEventDiscountCodeItem | null;
  editingDraftIndex: number | null;
  onDraftSubmit: (
    item: CreateEventDiscountCodeItem,
    editIndex?: number,
  ) => void;
}

const DiscountCodeDraftModal = ({
  open,
  onOpenChange,
  editingDraft,
  editingDraftIndex,
  onDraftSubmit,
}: DiscountCodeDraftModalProps) => {
  const defaultValues: DiscountCodeFormValues =
    editingDraft != null ? draftToFormValues(editingDraft) : emptyFormValues;

  const handleSubmit = (values: DiscountCodeFormValues) => {
    onDraftSubmit(formValuesToDraft(values), editingDraftIndex ?? undefined);
    onOpenChange(false);
    toast.success(
      editingDraftIndex != null ? "Coupon updated" : "Coupon added to event",
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto md:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingDraftIndex != null ? "Edit coupon" : "Add coupon"}
          </DialogTitle>
          <DialogDescription>
            This coupon will be created with the event. You can edit or remove
            it before submitting.
          </DialogDescription>
        </DialogHeader>

        <DiscountCodeFormBase
          key={editingDraftIndex !== null ? `edit-${editingDraftIndex}` : "add"}
          mode="create"
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={editingDraftIndex != null ? "Update" : "Add"}
          submitLoadingLabel={
            editingDraftIndex != null ? "Updating…" : "Adding…"
          }
        />
      </DialogContent>
    </Dialog>
  );
};

export default DiscountCodeDraftModal;
