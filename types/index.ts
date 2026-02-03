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

/** Payload for POST /api/v1/experiences (create). */
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
