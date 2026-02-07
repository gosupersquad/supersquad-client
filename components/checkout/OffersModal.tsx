"use client";

import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface OffersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyCoupon?: (code: string) => void;
}

const OffersModal = ({
  open,
  onOpenChange,
  onApplyCoupon,
}: OffersModalProps) => {
  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>(
      'input[name="couponCode"]',
    );

    const code = input?.value?.trim();
    if (code) onApplyCoupon?.(code);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-full max-h-dvh flex-col gap-0 p-0 sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-lg sm:p-6"
      >
        <DialogHeader className="border-border flex flex-row items-center gap-3 border-b px-4 py-3 sm:border-0 sm:px-0 sm:pt-0 sm:pb-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="shrink-0 sm:hidden"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <DialogTitle className="text-lg font-semibold">Offers</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-auto px-4 py-4 sm:px-0">
          <form onSubmit={handleApply} className="flex gap-2">
            <Input
              name="couponCode"
              placeholder="ENTER COUPON CODE"
              className="flex-1 uppercase placeholder:normal-case"
              autoComplete="off"
            />

            <Button
              type="submit"
              variant="secondary"
              className="shrink-0 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400"
            >
              APPLY
            </Button>
          </form>

          <div>
            <h3 className="text-foreground mb-3 text-sm font-medium">
              Available Coupons
            </h3>

            <p className="text-muted-foreground text-sm">
              No coupons available for this event yet.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OffersModal;
