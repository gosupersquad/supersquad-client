/** Mirrors server CreateEventPayload / Event model for form and API. */

export interface MediaItem {
  url: string;
  type: "image" | "video";
}

export interface ExperienceFAQ {
  question: string;
  answer: string;
}

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
  pricing: ExperiencePricing;
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
  pricing: ExperiencePricing;
  isActive: boolean;
}
