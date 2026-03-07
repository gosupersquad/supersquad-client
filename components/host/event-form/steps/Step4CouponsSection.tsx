"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import DiscountCodeDraftModal from "@/components/host/discount-code-form/DiscountCodeDraftModal";
import DiscountCodeFormModal from "@/components/host/DiscountCodeFormModal";
import DiscountCodesCards from "@/components/host/DiscountCodesCards";
import DiscountCodesTable from "@/components/host/DiscountCodesTable";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  deleteDiscountCode,
  listDiscountCodes,
  toggleDiscountCodeStatus,
  type DiscountCodeResponse,
} from "@/lib/discount-codes-client";
import {
  cn,
  formatDiscountCodeUsage,
  formatDiscountCodeValidity,
} from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useEventFormStore } from "@/store/event-form-store";
import type { CreateEventDiscountCodeItem } from "@/types";

const COUPONS_QUERY_KEY = ["discount-codes", "by-event"];

export interface Step4CouponsSectionProps {
  isCreate: boolean;
  eventId?: string;
}

interface DiscountCodeCardProps {
  draft: CreateEventDiscountCodeItem;
  index: number;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

const DiscountCodeCard = ({
  draft,
  index,
  onEdit,
  onRemove,
}: DiscountCodeCardProps) => {
  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{draft.code}</p>

          <p className="text-muted-foreground mt-0.5 text-sm">
            {draft.type === "percentage"
              ? `${draft.amount}% off`
              : `₹${draft.amount} off`}
          </p>

          <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" />
              {formatDiscountCodeValidity(draft)}
            </span>

            <span>Usage: {formatDiscountCodeUsage(draft)}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-xs",
                draft.type === "percentage"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
              )}
            >
              {draft.type === "percentage" ? "Percentage" : "Flat"}
            </span>

            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-xs",
                draft.isPublic !== false
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {draft.isPublic !== false ? "Public" : "Private"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(index)}
              >
                <Pencil className="size-4" />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>Edit discount code</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onRemove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>Delete discount code</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

/** Coupons block for Step 4: draft list (create) or API list + modal (edit). */
const Step4CouponsSection = ({
  isCreate,
  eventId,
}: Step4CouponsSectionProps) => {
  const { discountCodeDrafts, setDiscountCodeDrafts } = useEventFormStore();
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingDraftIndex, setEditingDraftIndex] = useState<number | null>(
    null,
  );
  const [editingApi, setEditingApi] = useState<DiscountCodeResponse | null>(
    null,
  );

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

  return (
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
            <div className="grid gap-4 sm:grid-cols-1">
              {discountCodeDrafts.map((draft, index) => (
                <DiscountCodeCard
                  key={`${draft.code}-${index}`}
                  draft={draft}
                  index={index}
                  onEdit={openEditDraft}
                  onRemove={removeDraft}
                />
              ))}
            </div>
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
                    deleteMutation.isPending && deleteMutation.variables != null
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
                    toggleMutation.isPending && toggleMutation.variables != null
                      ? (toggleMutation.variables as string)
                      : null
                  }
                  isDeletingId={
                    deleteMutation.isPending && deleteMutation.variables != null
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
  );
};

export default Step4CouponsSection;
