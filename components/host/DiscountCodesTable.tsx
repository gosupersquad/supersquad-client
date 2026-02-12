"use client";

import { Calendar, Pencil, Trash2 } from "lucide-react";

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
import {
  cn,
  formatDiscountCodeDiscount,
  formatDiscountCodeUsage,
  formatDiscountCodeValidity,
} from "@/lib/utils";

interface DiscountCodesTableProps {
  codes: DiscountCodeResponse[];
  onToggleStatus: (id: string) => void;
  onEdit: (item: DiscountCodeResponse) => void;
  onDelete: (item: DiscountCodeResponse) => void;
  isTogglingId?: string | null;
  isDeletingId?: string | null;
}

const DiscountCodesTable = ({
  codes,
  onToggleStatus,
  onEdit,
  onDelete,
  isTogglingId,
  isDeletingId,
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
          const isDeleting = isDeletingId === item._id;

          return (
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.code}</TableCell>

              <TableCell
                className={cn(
                  "uppercase",
                  item.type === "percentage"
                    ? "text-amber-500"
                    : "text-green-500",
                )}
              >
                {item.type}
              </TableCell>

              <TableCell>{formatDiscountCodeDiscount(item)}</TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="text-muted-foreground size-4" />

                  <span>{formatDiscountCodeValidity(item)}</span>
                </div>
              </TableCell>

              <TableCell>{formatDiscountCodeUsage(item)}</TableCell>

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
                <div className="flex items-center gap-1">
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
                        disabled={isDeleting}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>Delete discount code</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default DiscountCodesTable;
