"use client";

import { format } from "date-fns";
import { Calendar, Pencil } from "lucide-react";
import Link from "next/link";

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
import { getEventDuration } from "@/lib/utils";

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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>

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

          const startFormatted = event.startDate
            ? format(new Date(event.startDate), "d MMM")
            : "";

          const endFormatted = event.endDate
            ? format(new Date(event.endDate), "d MMM, yy")
            : "";

          const datesText =
            startFormatted && endFormatted
              ? `${startFormatted} – ${endFormatted}`
              : "No dates";

          return (
            <TableRow key={event._id}>
              <TableCell className="font-medium">{event.title}</TableCell>
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

              <TableCell>{event.spotsAvailable}</TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  <Calendar className="size-4 text-muted-foreground" />

                  <span>{datesText}</span>
                </div>
              </TableCell>

              <TableCell>{duration ?? "–"}</TableCell>

              <TableCell>
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ExperiencesTable;
