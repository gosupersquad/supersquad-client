/**
 * Ticket selection from landing (pricing bar / drawer) → checkout.
 * Stored in sessionStorage so checkout page can show the right number of
 * attendees and ticket types per attendee.
 */

export interface TicketBreakdownItem {
  code: string;
  label: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutTicketSelection {
  breakdown: TicketBreakdownItem[];
  /** Total number of attendees (sum of quantities). */
  totalQuantity: number;
}

const STORAGE_PREFIX = "supersquad-checkout";

export function getCheckoutStorageKey(username: string, eventSlug: string): string {
  return `${STORAGE_PREFIX}-${username}-${eventSlug}`;
}

export function setCheckoutTicketSelection(
  username: string,
  eventSlug: string,
  selection: CheckoutTicketSelection,
): void {
  if (typeof window === "undefined") return;
  const key = getCheckoutStorageKey(username, eventSlug);
  try {
    window.sessionStorage.setItem(key, JSON.stringify(selection));
  } catch {
    // ignore
  }
}

export function getCheckoutTicketSelection(
  username: string,
  eventSlug: string,
): CheckoutTicketSelection | null {
  if (typeof window === "undefined") return null;
  const key = getCheckoutStorageKey(username, eventSlug);
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as CheckoutTicketSelection;
    if (!Array.isArray(data.breakdown) || typeof data.totalQuantity !== "number")
      return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Expand breakdown into one slot per attendee (for checkout attendee forms).
 * e.g. Standard x2, Premium x1 → [ { code, label, unitPrice }, { code, label, unitPrice }, { code, label, unitPrice } ]
 */
export function expandBreakdownToAttendeeSlots(
  breakdown: TicketBreakdownItem[],
): { code: string; label: string; unitPrice: number }[] {
  const slots: { code: string; label: string; unitPrice: number }[] = [];
  for (const item of breakdown) {
    for (let i = 0; i < item.quantity; i++) {
      slots.push({
        code: item.code,
        label: item.label,
        unitPrice: item.unitPrice,
      });
    }
  }
  return slots;
}
