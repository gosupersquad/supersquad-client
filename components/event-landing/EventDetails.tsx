"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";

const EventDetails = ({
  location,
  startDate,
  endDate,
  dateDisplayText,
  description,
}: {
  location: string;
  startDate: string;
  endDate: string;
  dateDisplayText?: string;
  description: string;
}) => {
  let dateLabel = dateDisplayText?.trim();

  if (!dateLabel) {
    try {
      const start = parseISO(startDate.slice(0, 10));
      const end = parseISO(endDate.slice(0, 10));

      if (start.getTime() === end.getTime()) {
        dateLabel = format(start, "d MMMM ''yy");
      } else {
        dateLabel = `${format(start, "d MMM")} – ${format(end, "d MMM ''yy")}`;
      }
    } catch {
      dateLabel = startDate;
    }
  }

  let timeLabel = "";
  try {
    const start = new Date(startDate);

    if (start.getHours() !== 0 || start.getMinutes() !== 0) {
      timeLabel = format(start, "h:mm a");
      const end = new Date(endDate);

      if (end.getHours() !== 0 || end.getMinutes() !== 0) {
        timeLabel += ` – ${format(end, "h:mm a")}`;
      }
    }
  } catch {
    // ignore
  }

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <MapPin className="size-4 shrink-0" />
            <span>Location</span>
          </div>

          <p className="font-semibold text-foreground">{location}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calendar className="size-4 shrink-0" />
            <span>Dates</span>
          </div>

          <p className="font-semibold text-foreground">{dateLabel}</p>
        </div>
      </div>

      <div className="space-y-3">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {location && (
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              <span>Location: {location}</span>
            </li>
          )}

          {dateLabel && (
            <li className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0" />
              <span>Date: {dateLabel}</span>
            </li>
          )}

          {timeLabel && (
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" />
              <span>Time: {timeLabel}</span>
            </li>
          )}
        </ul>

        {description && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventDetails;
