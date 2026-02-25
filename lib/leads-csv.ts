import { Parser } from "@json2csv/plainjs";
import { format } from "date-fns";

import type { LeadsAttendee, LeadsBooking } from "./leads-client";

export type LeadRow = {
  attendee: LeadsAttendee;
  booking: LeadsBooking;
};

/**
 * Collect all unique custom question keys across attendees (for CSV columns).
 */
const getAllCustomAnswerKeys = (rows: LeadRow[]): string[] => {
  const set = new Set<string>();

  rows.forEach(({ attendee }) => {
    if (attendee.customAnswers) {
      Object.keys(attendee.customAnswers).forEach((k) => set.add(k));
    }
  });

  return Array.from(set).sort();
}

/**
 * Build a flat row for CSV: fixed fields + dynamic customAnswers columns.
 */
const buildRow = (
  { attendee, booking }: LeadRow,
  customKeys: string[],
): Record<string, string | number> => {
  const ticket = booking.ticketBreakdown?.find(
    (t) => t.code === attendee.ticketCode,
  );
  const ticketPrice = ticket?.unitPrice ?? 0;

  const row: Record<string, string | number> = {
    Name: attendee.name,
    Email: attendee.email,
    Phone: attendee.phone,
    Instagram: attendee.instagram ?? "",
    "Ticket code": attendee.ticketCode,
    "Ticket price": ticketPrice,
    "Booking ID": booking.id ?? "",
    "Payment status": booking.paymentStatus,
    "Booking total": booking.totalAmount,
    "Created at": booking.createdAt
      ? format(new Date(booking.createdAt), "yyyy-MM-dd HH:mm")
      : "",
  };

  customKeys.forEach((key) => {
    row[key] = attendee.customAnswers?.[key] ?? "";
  });

  return row;
}

/**
 * Convert leads (current view) to CSV string. Fixed columns + one per custom question.
 */
const buildLeadsCsv = (rows: LeadRow[]): string => {
  if (rows.length === 0) {
    return "";
  }

  const customKeys = getAllCustomAnswerKeys(rows);
  const data = rows.map((r) => buildRow(r, customKeys));

  const parser = new Parser({
    fields: [
      "Name",
      "Email",
      "Phone",
      "Instagram",
      "Ticket code",
      "Ticket price",
      "Booking ID",
      "Payment status",
      "Booking total",
      "Created at",
      ...customKeys,
    ],
  });

  return parser.parse(data);
}

/**
 * Trigger browser download of a CSV string with the given filename.
 */
const downloadCsv = (csv: string, filename: string): void => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export current leads to CSV and trigger download. Filename: leads-{slug}-{date}.csv
 */
export const exportLeadsToCsv = (
  rows: LeadRow[],
  eventSlug: string,
): void => {
  if (rows.length === 0) return;

  const csv = buildLeadsCsv(rows);

  const dateStr = format(new Date(), "yyyy-MM-dd");
  const safeSlug = eventSlug.replace(/[^a-z0-9-_]/gi, "-").slice(0, 50);

  const filename = `leads-${safeSlug}-${dateStr}.csv`;

  downloadCsv(csv, filename);
}
