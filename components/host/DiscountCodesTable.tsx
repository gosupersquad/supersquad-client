"use client";

import { format } from "date-fns";
import { Calendar, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function formatDiscount(item: DiscountCodeResponse): string {
  if (item.type === "percentage") return `${item.amount}%`;
  return `₹${item.amount}`;
}

function formatUsage(item: DiscountCodeResponse): string {
  const used = item.usedCount ?? 0;
  if (item.maxUsage == null) return `${used} / ∞`;
  return `${used} / ${item.maxUsage}`;
}

interface DiscountCodesTableProps {
  codes: DiscountCodeResponse[];
  onToggleStatus: (id: string) => void;
  onEdit: (item: DiscountCodeResponse) => void;
  isTogglingId?: string | null;
}

const DiscountCodesTable = ({
  codes,
  onToggleStatus,
  onEdit,
  isTogglingId,
}: DiscountCodesTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Type</TableHead>

          <TableHead>Discount</TableHead>
          <TableHead>Validity</TableHead>

          <TableHead>Usage</TableHead>
          <TableHead>Status</TableHead>

          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {codes.map((item) => {
          const isToggling = isTogglingId === item._id;
          return (
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.code}</TableCell>
              <TableCell className="capitalize">{item.type}</TableCell>

              <TableCell>{formatDiscount(item)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="text-muted-foreground size-4" />

                  <span>{formatValidity(item)}</span>
                </div>
              </TableCell>

              <TableCell>{formatUsage(item)}</TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="block">
                        <Switch
                          checked={item.isActive}
                          onCheckedChange={() => onToggleStatus(item._id)}
                          disabled={isToggling}
                        />
                      </div>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>
                        {item.isActive ? "Deactivate code" : "Activate code"}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      item.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </TableCell>

              <TableCell>
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default DiscountCodesTable;
