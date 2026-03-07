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
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  deleteDiscountCode,
  listDiscountCodes,
  toggleDiscountCodeStatus,
  type DiscountCodeResponse,
} from "@/lib/discount-codes-client";
import { useAuthStore } from "@/store/auth-store";
import { useEventFormStore } from "@/store/event-form-store";
import type { CreateEventDiscountCodeItem } from "@/types";

const COUPONS_QUERY_KEY = ["discount-codes", "by-event"];

export interface Step4CouponsSectionProps {
  isCreate: boolean;
  eventId?: string;
}

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
