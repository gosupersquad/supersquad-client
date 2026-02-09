"use client";

import { format } from "date-fns";
import { Calendar, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DiscountCodeResponse } from "@/lib/discount-codes-client";

function formatValidity(item: DiscountCodeResponse): string {
  const start = item.startsAt
    ? format(new Date(item.startsAt), "d MMM yyyy")
    : null;

  const end = item.expiresAt
    ? format(new Date(item.expiresAt), "d MMM yyyy")
    : null;

  if (!start && !end) return "Always";
  if (start && end) return `${start} – ${end}`;

  if (start) return `From ${start}`;
  return `Until ${end}`;
}

function formatUsage(item: DiscountCodeResponse): string {
  const used = item.usedCount ?? 0;
  if (item.maxUsage == null) return `${used} / ∞`;

  return `${used} / ${item.maxUsage}`;
}

interface DiscountCodesCardsProps {
  codes: DiscountCodeResponse[];
  onEdit: (item: DiscountCodeResponse) => void;
}

const DiscountCodesCards = ({ codes, onEdit }: DiscountCodesCardsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-1">
      {codes.map((item) => (
        <div
          key={item._id}
          className="border-border bg-card rounded-xl border p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{item.code}</p>

              <p className="text-muted-foreground mt-0.5 text-sm">
                {item.type === "percentage"
                  ? `${item.amount}% off`
                  : `₹${item.amount} off`}
              </p>

              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 shrink-0" />
                  {formatValidity(item)}
                </span>

                <span>Usage: {formatUsage(item)}</span>
              </div>

              <span
                className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${
                  item.isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {item.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="shrink-0"
                >
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>Edit discount code</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiscountCodesCards;
