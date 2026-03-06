import type { StateCreator } from "zustand";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  CreateEventDiscountCodeItem,
  EventFormBasics,
  EventQuestion,
  EventTicket,
  ExperienceFAQ,
  MediaItem,
} from "@/types";

/** Step order: 1 = Media, 2 = Event details, 3 = Tickets, 4 = FAQs + questions + coupons. */
const TOTAL_STEPS = 4;

const defaultBasics: EventFormBasics = {
  title: "",
  location: "",
  description: "",
  startDate: "",
  endDate: "",
  isFreeRsvp: false,
  isActive: true,
  freeSpots: undefined,
};

const defaultTicket: EventTicket = {
  code: "standard",
  label: "Standard",
  price: 0,
  currency: "INR",
  totalSpots: 0,
  spotsAvailable: 0,
};

interface EventFormState {
  step: number;
  basics: EventFormBasics;
  media: MediaItem[];
  faqs: ExperienceFAQ[];
  tickets: EventTicket[];
  customQuestions: EventQuestion[];
  /** Create flow only: coupon drafts sent with event payload on submit. */
  discountCodeDrafts: CreateEventDiscountCodeItem[];
}

interface EventFormActions {
  setStep: (step: number) => void;
  setBasics: (basics: Partial<EventFormBasics>) => void;
  setMedia: (media: MediaItem[]) => void;
  setFaqs: (faqs: ExperienceFAQ[]) => void;
  setTickets: (tickets: EventTicket[]) => void;
  setCustomQuestions: (questions: EventQuestion[]) => void;
  setDiscountCodeDrafts: (drafts: CreateEventDiscountCodeItem[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export type EventFormStore = EventFormState & EventFormActions;

const initialState: EventFormState = {
  step: 1,
  basics: defaultBasics,
  media: [],
  faqs: [],
  tickets: [defaultTicket],
  customQuestions: [],
  discountCodeDrafts: [],
};

const STORAGE_KEY = "supersquad-event-form";

export const createEventFormSlice: StateCreator<
  EventFormStore,
  [],
  [],
  EventFormStore
> = (set) => ({
  ...initialState,

  setStep: (step) =>
    set({ step: Math.max(1, Math.min(step, TOTAL_STEPS)) }),

  setBasics: (basics) =>
    set((state) => ({
      basics: { ...state.basics, ...basics },
    })),

  setMedia: (media) => set({ media }),

  setFaqs: (faqs) => set({ faqs }),

  setTickets: (tickets) => set({ tickets }),

  setCustomQuestions: (customQuestions) => set({ customQuestions }),

  setDiscountCodeDrafts: (discountCodeDrafts) => set({ discountCodeDrafts }),

  nextStep: () =>
    set((state) => ({
      step: Math.min(state.step + 1, TOTAL_STEPS),
    })),

  prevStep: () =>
    set((state) => ({
      step: Math.max(state.step - 1, 1),
    })),

  reset: () => set(initialState),
});

export const useEventFormStore = create<EventFormStore>()(
  persist(createEventFormSlice, { name: STORAGE_KEY })
);

export { TOTAL_STEPS };
