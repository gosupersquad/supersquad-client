"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2, Tag } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { listPublicDiscountCodesForEvent } from "@/lib/discount-codes-client";
import { formatPublicDiscountLabel } from "@/lib/utils";

interface OffersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  eventSlug: string;
  onApplyCoupon?: (code: string) => Promise<boolean>;
}

const OffersModal = ({
  open,
  onOpenChange,
  username,
  eventSlug,
  onApplyCoupon,
}: OffersModalProps) => {
  const [isApplying, setIsApplying] = useState(false);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  const { data: availableCoupons = [], isLoading: loadingList } = useQuery({
    queryKey: ["public-discount-codes", username, eventSlug],
    queryFn: () => listPublicDiscountCodesForEvent(username, eventSlug),
    enabled: open && !!username && !!eventSlug,
  });

  const applyCode = async (code: string) => {
    if (!onApplyCoupon) return;
    setApplyingCode(code);

    try {
      const ok = await onApplyCoupon(code);
      if (ok) onOpenChange(false);
    } finally {
      setApplyingCode(null);
    }
  };

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>(
      'input[name="couponCode"]',
    );
    const code = input?.value?.trim();
    if (!code) return;
    setIsApplying(true);
    try {
      await applyCode(code);
      const inp = form.querySelector<HTMLInputElement>(
        'input[name="couponCode"]',
      );

      if (inp) inp.value = "";
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 flex h-full max-h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:border sm:p-6"
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
              disabled={isApplying}
            />

            <Button
              type="submit"
              variant="secondary"
              className="shrink-0 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400"
              disabled={isApplying}
            >
              {isApplying ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "APPLY"
              )}
            </Button>
          </form>

          <div>
            <h3 className="text-foreground mb-3 text-sm font-medium">
              Available Coupons
            </h3>

            {loadingList ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : availableCoupons.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No coupons available for this event yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {availableCoupons.map((c) => {
                  const applying = applyingCode === c.code;

                  return (
                    <li key={c.code}>
                      <div
                        className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                        role="article"
                        aria-label={`Coupon ${c.code}, ${formatPublicDiscountLabel(c.amount, c.type)}`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
                            <Tag className="size-5 text-amber-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-foreground font-semibold uppercase">
                              {c.code}
                            </p>

                            <p className="text-muted-foreground text-sm">
                              {formatPublicDiscountLabel(c.amount, c.type)}
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="shrink-0 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400"
                          disabled={isApplying || applyingCode !== null}
                          onClick={() => applyCode(c.code)}
                        >
                          {applying ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OffersModal;
