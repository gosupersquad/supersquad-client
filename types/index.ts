/** Server API response wrapper: { statusCode, data, message, success }. */
export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  success: boolean;
}

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
  /** Optional description (e.g. benefits) shown on landing and checkout. */
  description?: string;
}

/** Custom question type: free text or dropdown. Must match server QUESTION_TYPES. */
export const QUESTION_TYPES = ["string", "dropDown"] as const;
export type EventQuestionType = (typeof QUESTION_TYPES)[number];

/** Host-defined custom question for attendee form. */
export interface EventQuestion {
  label: string;
  required: boolean;
  /** Default "string" (text input). Use "dropDown" for select; then options required. */
  type?: EventQuestionType;
  /** Options for dropDown type (ignored for string). */
  options?: string[];
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
  isFreeRsvp?: boolean;
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
  isFreeRsvp?: boolean;
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
  /** When true, no payment; reserve creates a paid booking and redirects to success. */
  isFreeRsvp?: boolean;
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

/** Alias: Same shape as EventQuestion (snapshotted on Booking). */
export type SnapshotQuestion = EventQuestion;

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

/** Discount type: flat (₹ off) or percentage (% off). */
export type DiscountType = "flat" | "percentage";

/** Minimal fields for discount code display formatting (used by utils). */
export interface DiscountCodeDisplayFields {
  amount: number;
  type?: DiscountType;
  usedCount?: number;
  maxUsage?: number | null;
  startsAt?: string;
  expiresAt?: string;
}

// --- Checkout applied discount (state + validate response discount) ---

/** Discount applied at checkout. discountCodeId set when validated so create-order can send it. */
export interface AppliedDiscount {
  code: string;
  type: DiscountType;
  amount: number;
  currency: string;
  discountCodeId?: string;
}

// --- Payments (create-order, verify) ---

export interface CreateOrderCustomer {
  name: string;
  email: string;
  phone: string;
  instagram?: string;
}

export interface CreateOrderAttendee {
  ticketCode: string;
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  customAnswers?: Record<string, string>;
}

/** Payload for POST /payments/create-order. Must match server createOrderSchema. */
export interface CreateOrderPayload {
  eventId: string;
  returnUrl: string;
  orderId?: string;
  customer: CreateOrderCustomer;
  ticketBreakdown: Array<{ code: string; quantity: number; unitPrice: number }>;
  attendees: CreateOrderAttendee[];
  expectedTotal: number;
  /** Applied discount (id from validate, codeName e.g. SAVE20, amount in ₹). */
  discountCode?: { id: string; codeName: string; amount: number };
}

export interface CreateOrderResult {
  orderId: string;
  /** Omitted when freeRsvp is true. */
  sessionId?: string;
  /** True when event is free RSVP; redirect to payment/status?order_id=... */
  freeRsvp?: boolean;
}

export interface VerifyPaymentResult {
  orderId: string;
  status: PaymentStatus;
}
