"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type {
  CreateDiscountCodePayload,
  DiscountCodeResponse,
  UpdateDiscountCodePayload,
} from "@/lib/discount-codes-client";
import {
  createDiscountCode,
  updateDiscountCode,
} from "@/lib/discount-codes-client";
import { cn } from "@/lib/utils";

type FormState = {
  code: string;
  type: "percentage" | "flat";
  amount: string;
  maxUsage: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  code: "",
  type: "percentage",
  amount: "",
  maxUsage: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

interface DiscountCodeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: DiscountCodeResponse | null;
  token: string;
  onSuccess: () => void;
}

const DiscountCodeFormModal = ({
  open,
  onOpenChange,
  editing,
  token,
  onSuccess,
}: DiscountCodeFormModalProps) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!editing;

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setForm({
        code: editing.code,
        type: editing.type,
        amount: String(editing.amount),
        maxUsage: editing.maxUsage != null ? String(editing.maxUsage) : "",
        startsAt: editing.startsAt
          ? new Date(editing.startsAt).toISOString().slice(0, 10)
          : "",
        expiresAt: editing.expiresAt
          ? new Date(editing.expiresAt).toISOString().slice(0, 10)
          : "",
        isActive: editing.isActive,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = Number(form.amount);

    if (Number.isNaN(amountNum) || amountNum < 0) {
      toast.error("Amount must be a positive number");
      return;
    }

    if (form.type === "percentage" && amountNum > 100) {
      toast.error("Percentage must be between 0 and 100");
      return;
    }

    if (form.startsAt && form.expiresAt) {
      if (new Date(form.expiresAt) <= new Date(form.startsAt)) {
        toast.error("End date must be after start date");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        const payload: UpdateDiscountCodePayload = {
          type: form.type,
          amount: amountNum,
          isActive: form.isActive,
        };

        if (form.maxUsage.trim() !== "") {
          const max = parseInt(form.maxUsage, 10);
          if (!Number.isNaN(max) && max >= 0) payload.maxUsage = max;
        }

        if (form.startsAt) payload.startsAt = form.startsAt;
        if (form.expiresAt) payload.expiresAt = form.expiresAt;

        await updateDiscountCode(editing._id, payload, token);
        toast.success("Discount code updated");
      } else {
        const code = form.code.trim().toUpperCase();

        if (!code) {
          toast.error("Code is required");
          setIsSubmitting(false);
          return;
        }

        const payload: CreateDiscountCodePayload = {
          code,
          type: form.type,
          amount: amountNum,
          currency: "INR",
          isActive: form.isActive,
        };

        if (form.maxUsage.trim() !== "") {
          const max = parseInt(form.maxUsage, 10);
          if (!Number.isNaN(max) && max >= 0) payload.maxUsage = max;
        }

        if (form.startsAt) payload.startsAt = form.startsAt;
        if (form.expiresAt) payload.expiresAt = form.expiresAt;

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
          <DialogTitle>
            {isEdit ? "Edit discount code" : "Create discount code"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update the discount code details. Code cannot be changed."
              : "Create a new discount code for your events."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>

            <Input
              id="code"
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  code: e.target.value.toUpperCase(),
                }))
              }
              placeholder="e.g. SAVE20"
              disabled={isEdit}
              className={isEdit ? "bg-muted" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>

            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  checked={form.type === "percentage"}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, type: "percentage" }))
                  }
                  className="size-4"
                />
                Percentage
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  checked={form.type === "flat"}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, type: "flat" }))
                  }
                  className="size-4"
                />
                Flat (₹)
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount {form.type === "percentage" ? "(0–100)" : "(₹)"}
            </Label>

            <Input
              id="amount"
              type="number"
              min={0}
              max={form.type === "percentage" ? 100 : undefined}
              step={form.type === "percentage" ? 1 : 0.01}
              value={form.amount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder={form.type === "percentage" ? "20" : "100"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxUsage">Max usage (optional)</Label>

            <Input
              id="maxUsage"
              type="number"
              min={0}
              value={form.maxUsage}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, maxUsage: e.target.value }))
              }
              placeholder="Unlimited if empty"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Start date (optional)</Label>

              <Input
                id="startsAt"
                type="date"
                value={form.startsAt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startsAt: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">End date (optional)</Label>

              <Input
                id="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={form.isActive}
              onCheckedChange={(checked) =>
                setForm((prev) => ({ ...prev, isActive: checked }))
              }
            />

            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {isEdit ? "Updating…" : "Creating…"}
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountCodeFormModal;
