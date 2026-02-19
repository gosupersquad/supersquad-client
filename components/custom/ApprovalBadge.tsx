"use client";

import { Info } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ApprovalStatus = "pending" | "approved" | "rejected";

interface ApprovalBadgeProps {
  approvalStatus: ApprovalStatus;
  rejectedReason?: string | null;
  /** Table: light badge (e.g. in table cell). Card: solid badge (e.g. on image overlay). */
  variant?: "table" | "card";
}

const ApprovalBadge = ({
  approvalStatus,
  rejectedReason,
  variant = "table",
}: ApprovalBadgeProps) => {
  const [reasonOpen, setReasonOpen] = useState(false);

  const status = approvalStatus ?? "pending";
  const reason = rejectedReason?.trim();

  const label =
    status === "approved"
      ? "Approved"
      : status === "rejected"
        ? "Rejected"
        : "Pending";

  const badgeClass =
    variant === "table"
      ? status === "approved"
        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        : status === "rejected"
          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
      : status === "approved"
        ? "bg-green-600/90 text-white"
        : status === "rejected"
          ? "bg-red-600/90 text-white"
          : "bg-amber-500/90 text-white";

  const paddingClass = variant === "table" ? "px-2 py-1" : "px-2 py-0.5";

  const badge = (
    <span
      className={`rounded-full text-xs font-medium ${paddingClass} ${badgeClass}`}
    >
      {label}
    </span>
  );

  const showReasonButton = status === "rejected" && !!reason;

  return (
    <>
      <div className="flex items-center gap-0">
        {badge}
        {showReasonButton && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={
              variant === "card"
                ? "h-7 w-7 shrink-0 bg-black/80 text-white hover:bg-black hover:text-white"
                : "text-muted-foreground hover:text-foreground h-7 w-7 shrink-0"
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setReasonOpen(true);
            }}
            aria-label="View rejection reason"
          >
            <Info className="size-4" />
          </Button>
        )}
      </div>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Rejection reason</DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground text-sm">{reason}</p>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApprovalBadge;
