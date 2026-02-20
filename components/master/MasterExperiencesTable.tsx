"use client";

import { Calendar, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
import { APPROVAL_STATUSES, type ApprovalStatus } from "@/lib/constants";
import type { MasterEventListItem } from "@/lib/master-admin/experiences-client";
import { formatEventDates, getEventDuration } from "@/lib/utils";

function SpotsCell({ item }: { item: MasterEventListItem }) {
  const total = item.totalSpots ?? 0;
  const left = item.spotsAvailable ?? 0;

  if (total === 0) return <span>–</span>;
  if (left === 0) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
        Sold out
      </span>
    );
  }

  return (
    <span>
      {left} / {total}
    </span>
  );
}

function getApprovalTextColor(status: ApprovalStatus) {
  switch (status) {
    case APPROVAL_STATUSES.APPROVED:
      return "text-green-400";
    case APPROVAL_STATUSES.REJECTED:
      return "text-red-400";
    case APPROVAL_STATUSES.PENDING:
    default:
      return "text-amber-400";
  }
}

export interface MasterExperiencesTableProps {
  events: MasterEventListItem[];
  onApprovalChange: (event: MasterEventListItem, value: ApprovalStatus) => void;
  isUpdatingId: string | null;
}

export default function MasterExperiencesTable({
  events,
  onApprovalChange,
  isUpdatingId,
}: MasterExperiencesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Host</TableHead>

          <TableHead>Spots left</TableHead>
          <TableHead>Dates</TableHead>

          <TableHead>Duration</TableHead>
          <TableHead>Approval</TableHead>

          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {events.map((event) => {
          const duration = getEventDuration(
            String(event.startDate),
            String(event.endDate),
          );

          const { datesText } = formatEventDates(
            String(event.startDate),
            String(event.endDate),
          );

          const viewLiveHref = `/hosts/${event.host.username}/events/${event.slug}`;
          const isUpdating = isUpdatingId === event.id;

          return (
            <TableRow key={event.id}>
              <TableCell
                className="max-w-[200px] truncate font-medium"
                title={event.title}
              >
                {event.title}
              </TableCell>

              <TableCell>
                <span className="font-medium">{event.host.name}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  (@{event.host.username})
                </span>
              </TableCell>

              <TableCell>
                <SpotsCell item={event} />
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="text-muted-foreground size-4" />
                  <span>{datesText}</span>
                </div>
              </TableCell>

              <TableCell>{duration ?? "–"}</TableCell>

              <TableCell>
                <div className="relative flex items-center gap-1">
                  {isUpdating ? (
                    <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" />
                  ) : null}

                  <select
                    className={`border-input bg-background focus:ring-ring rounded-md border px-2 py-1.5 text-sm ${getApprovalTextColor((event.approvalStatus ?? APPROVAL_STATUSES.PENDING) as ApprovalStatus)} focus:ring-2 focus:outline-none`}
                    value={event.approvalStatus ?? APPROVAL_STATUSES.PENDING}
                    onChange={(e) =>
                      onApprovalChange(event, e.target.value as ApprovalStatus)
                    }
                    disabled={isUpdating}
                  >
                    <option
                      value={APPROVAL_STATUSES.PENDING}
                      className="text-black dark:text-white"
                    >
                      Pending
                    </option>

                    <option
                      value={APPROVAL_STATUSES.APPROVED}
                      className="text-black dark:text-white"
                    >
                      Approved
                    </option>

                    <option
                      value={APPROVAL_STATUSES.REJECTED}
                      className="text-black dark:text-white"
                    >
                      Rejected
                    </option>
                  </select>
                </div>
              </TableCell>

              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={viewLiveHref}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>View live page</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
