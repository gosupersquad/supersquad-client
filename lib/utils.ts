import { clsx, type ClassValue } from "clsx"
import { format, parseISO, startOfDay } from "date-fns"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Start of today (00:00:00) for date comparisons. */
export function startOfToday(): Date {
  return startOfDay(new Date())
}

/** Parse YYYY-MM-DD string to Date. Returns null if invalid or empty. */
export function parseISOToDate(iso: string): Date | null {
  if (!iso || iso.length < 10) return null

  try {
    const d = parseISO(iso.slice(0, 10))
    return Number.isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

/** Format Date to YYYY-MM-DD for API/store. */
export function formatDateToISO(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

/** Event duration from start/end date strings. Returns "X Days" or null for single-day. */
export function getEventDuration(startDate: string, endDate: string): string | null {
  const start = parseISO(startDate.slice(0, 10))
  const end = parseISO(endDate.slice(0, 10))

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null

  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return days === 1 ? null : `${days} Days`
}
