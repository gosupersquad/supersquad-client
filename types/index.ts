/** Mirrors server CreateEventPayload / Event model for form and API. */

export interface MediaItem {
  url: string;
  type: "image" | "video";
}

export interface ExperienceFAQ {
  question: string;
  answer: string;
}

/**
 * Single ticket type for an event.
 * code: generated from label (e.g. slug) for linking; sent on create/update.
 * label: user-facing (e.g. "Standard", "Premium").
 */
export interface EventTicket {
  code: string;
  label: string;
  price: number;
  currency: "INR";
}

/** Host-defined custom question for attendee form (label + required). */
export interface EventQuestion {
  label: string;
  required: boolean;
}

/** @deprecated Legacy single-price; use EventTicket[] for new events. */
export interface ExperiencePricing {
  price: number;
  currency: "INR";
}

/** Payload for POST /api/v1/admin/experiences (create). */
export interface CreateEventPayload {
  title: string;
  slug?: string;
  location: string;
  description: string;
  spotsAvailable: number;
  startDate: string; // ISO
  endDate: string;
  dateDisplayText?: string;
  media: MediaItem[];
  faqs: ExperienceFAQ[];
  tickets: EventTicket[];
  customQuestions?: EventQuestion[];
}

/** Payload for PUT /api/v1/admin/experiences/:id (update). Partial of create. */
export type UpdateEventPayload = Partial<CreateEventPayload>;

/** Step 1 form values (basics). */
export interface EventFormBasics {
  title: string;
  slug: string;
  location: string;
  description: string;
  spotsAvailable: number;
  startDate: string;
  endDate: string;
  dateDisplayText: string;
  isActive: boolean;
}

/** Host as returned by public event API (populated hostId). */
export interface PublicEventHost {
  _id: string;
  name: string;
  username: string;
  image?: string;
  bio?: string;
  instagram?: { url?: string; followerCount?: number };
}

/** Public event for landing page (event + populated host). */
export interface PublicEvent {
  _id: string;
  hostId: PublicEventHost;
  title: string;
  slug: string;
  location: string;
  description: string;
  spotsAvailable: number;
  startDate: string;
  endDate: string;
  dateDisplayText?: string;
  media: MediaItem[];
  faqs: ExperienceFAQ[];
  tickets: EventTicket[];
  customQuestions?: EventQuestion[];
  isActive: boolean;
}

// --- Booking (for checkout; mirrors server) ---

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface TicketBreakdownItem {
  code: string;
  quantity: number;
  unitPrice: number;
}

/** Snapshot ticket shape (same as EventTicket). */
export interface SnapshotTicket {
  code: string;
  label: string;
  price: number;
  currency: string;
}

export interface SnapshotQuestion {
  label: string;
  required: boolean;
}

/** Experience snapshot stored on Booking at creation time. */
export interface ExperienceSnapshot {
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  itinerary?: string;
  media: MediaItem[];
  tickets: SnapshotTicket[];
  customQuestions: SnapshotQuestion[];
}

/** One attendee (one ticket). customAnswers keyed by question label. */
export interface BookingAttendee {
  ticketCode: string;
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  customAnswers: Record<string, string>;
}
