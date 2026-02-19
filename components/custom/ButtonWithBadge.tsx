"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface ButtonWithBadgeProps {
  icon: LucideIcon;
  label: string;
  /** When provided and > 0, shows a pill badge overlaying the icon (top-right). */
  count?: number;
  iconClassName?: string;
  labelClassName?: string;
  className?: string;
}

/**
 * Icon with optional count badge overlaying top-right (pill style) and label below.
 * Use in nav items (e.g. mobile drawer) where badge should sit on the icon, not below the label.
 */
const ButtonWithBadge = ({
  icon: Icon,
  label,
  count,
  iconClassName,
  labelClassName,
  className,
}: ButtonWithBadgeProps) => {
  const showBadge = count !== undefined && count > 0;
  const badgeLabel =
    count !== undefined && count > 99 ? "99+" : String(count ?? 0);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1",
        className,
      )}
    >
      <div className="relative inline-flex shrink-0">
        <Icon className={cn("size-5", iconClassName)} aria-hidden />
        {showBadge && (
          <span
            className="text-primary-foreground absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-rose-300 px-1.5 py-0.5 text-[10px] leading-none font-bold"
            aria-label={`${count} pending`}
          >
            {badgeLabel}
          </span>
        )}
      </div>

      <span className={cn("text-xs", labelClassName)}>{label}</span>
    </div>
  );
};

export default ButtonWithBadge;
