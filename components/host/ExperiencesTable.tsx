"use client";

import { Calendar, ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";

import ApprovalBadge from "@/components/custom/ApprovalBadge";
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
import type { EventResponse } from "@/lib/experiences-client";
import { formatEventDates, getEventDuration } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

interface ExperiencesTableProps {
  events: EventResponse[];
  onToggleStatus: (id: string) => void;
  isTogglingId?: string | null;
}

const ExperiencesTable = ({
  events,
  onToggleStatus,
  isTogglingId,
}: ExperiencesTableProps) => {
  const user = useAuthStore((s) => s.user);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Approval</TableHead>
          <TableHead>Spots</TableHead>
          <TableHead>Dates</TableHead>

          <TableHead>Duration</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {events.map((event) => {
          const isToggling = isTogglingId === event._id;
          const duration = getEventDuration(event.startDate, event.endDate);

          const { datesText } = formatEventDates(
            event.startDate,
            event.endDate,
          );

          const viewLiveHref =
            user?.username && event.slug
              ? `/hosts/${user.username}/events/${event.slug}`
              : null;

          return (
            <TableRow key={event._id}>
              <TableCell
                className="max-w-[200px] truncate font-medium"
                title={event.title}
              >
                {event.title}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="block">
                        <Switch
                          checked={event.isActive}
                          onCheckedChange={() => onToggleStatus(event._id)}
                          disabled={isToggling}
                        />
                      </div>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>
                        {event.isActive ? "Deactivate event" : "Activate event"}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      event.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {event.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <ApprovalBadge
                  approvalStatus={event.approvalStatus ?? "pending"}
                  rejectedReason={event.rejectedReason}
                  variant="table"
                />
              </TableCell>

              <TableCell>
                {event.spotsAvailable === 0 ? (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                    Sold out
                  </span>
                ) : (
                  event.spotsAvailable
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="text-muted-foreground size-4" />

                  <span>{datesText}</span>
                </div>
              </TableCell>

              <TableCell>{duration ?? "–"}</TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/host/experiences/${event._id}/edit?type=event`}
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>Edit event</p>
                    </TooltipContent>
                  </Tooltip>

                  {viewLiveHref && (
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
                        <p>View live</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ExperiencesTable;
