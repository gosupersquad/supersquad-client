"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DiscountCodeResponse } from "@/lib/discount-codes-client";
import {
  formatDiscountCodeUsage,
  formatDiscountCodeValidity,
} from "@/lib/utils";

interface DiscountCodesCardsProps {
  codes: DiscountCodeResponse[];
  onEdit: (item: DiscountCodeResponse) => void;
  onDelete: (item: DiscountCodeResponse) => void;
  isDeletingId?: string | null;
}

const DiscountCodesCards = ({
  codes,
  onEdit,
  onDelete,
  isDeletingId,
}: DiscountCodesCardsProps) => {
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
                ₹{item.amount} off
              </p>

              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 shrink-0" />
                  {formatDiscountCodeValidity(item)}
                </span>

                <span>Usage: {formatDiscountCodeUsage(item)}</span>
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

            <div className="flex shrink-0 gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
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
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(item)}
                    disabled={isDeletingId === item._id}
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
      ))}
    </div>
  );
};

export default DiscountCodesCards;
