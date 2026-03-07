# Supersquad client – progress & context

**Purpose:** Single source of truth for progress and context. Update as we go; refer when summarizing or continuing work.

---

## Constraints (do not remove)

1. **Clean, maintainable code** – Follow industry standards; no spaghetti.
2. **PROGRESS.md** – Record progress and decisions here; refer when context is lost.
3. **No hallucinations** – Only state what we can verify from code or PRD.

---

## Conventions

- **Custom components:** New custom components go in `components/custom/`, not `components/ui/` (ui = shadcn).
- **Component format:** `const ComponentName = () => {}` and `export default ComponentName`.
- **Upload:** Client uses only `POST /api/v1/upload/media` (field `files`, array).
- **Toasts:** react-hot-toast; toaster in root layout (top-center, 4s). One success toast per flow to avoid spam.

---

## Architecture (brief)

- **Single app:** app.gosupersquad.com. Host routes: `app/host/*`. Master Admin: `app/admin/master/*`. Public: `/`, `/hosts/[username]/events/[eventSlug]` (and checkout, payment/status).
- **Auth:** Zustand store (`token`, `user`, `role`); persisted. Login returns `role` ('host' | 'master'); redirect by role (master → `/admin/master`, host → `/host/dashboard`).
- **robots.txt:** `app/robots.ts` — Disallow `/admin/master` and `/host/` (host dashboard); allow only public routes (`/`, `/hosts/`, optionally `/host/login`).

---

## Implemented (summary)

- **Host:** Login, layout (guard + HostShell), dashboard, experiences list (table + cards, Fuse search, toggle status, edit, view live), approval column + badges (ApprovalBadge; Rejected + reason via Dialog), event create/edit **(4-step form: Media → Event details → Tickets → One last step; coupons in Step 4 via Step4CouponsSection)**, discount codes CRUD (dedicated page), leads (list + detail, Confirmed/Abandoned toggle).
- **Public:** Event landing (SSR), checkout, payment status page (verify, order summary).
- **MAP:** Pending (cards, Fuse search, approve/reject, preview); Preview page (event landing, pricing bar disabled); Hosts (list, Create/Update modals, isActive, Fuse); All experiences (table/cards, Fuse, View live); 403 → redirect + toast.
- **Auth:** Host deactivation: server 403 "account deactivated"; client QueryProvider onError → clearAuth, toast, router.push('/host/login').

---

## Event form refactor – target (4 steps)

**Goal:** New step order and fields; spots at ticket level; coupons CRUD in Step 4 (create: in-memory drafts + bulk payload; edit: list from API + full CRUD in modal). Backend provides virtuals for event.totalSpots / event.spotsAvailable and ticket-level totalSpots/spotsAvailable.

### Step names and content

1. **Media** – Add images (existing upload, max 6). Free RSVP toggle.
2. **Event details** – Event name, **Venue** (backend field `location`; UI label "Venue"), Start date+time, End date+time, Description. If Free RSVP: single "Spots" input (used for implicit free-rsvp ticket). If Paid: no spots here.
3. **Tickets** – Shown only when **paid**. Per ticket: **Title** (backend `label`; UI label "Title"), Price, Spots (totalSpots/spotsAvailable both set from this), Description. Add/remove ticket types. When Free RSVP: skip this step (backend gets one ticket code `free-rsvp`, label "Free RSVP", spots from Step 2).
4. **One last step** – FAQs, Custom questions, **Coupons (full CRUD)**. Create flow: coupons are drafts in state; submit sends event + `discountCodes[]` in one payload; backend creates event then creates each discount code. Edit flow: list coupons for this event (API: list with experienceId filter or client filter); Add coupon (modal) → POST create with eventId; Edit/Delete per row (reuse existing modal/components).

### Coupons in Step 4

- **Create event:** Step 4 shows FAQs, custom questions, and coupon drafts (add/edit/remove in UI, stored in form state). On Submit, payload includes `discountCodes` array; backend creates event then creates each code with experienceId = new event id. No eventId until submit; bulk payload is the agreed approach.
- **Edit event:** Step 4 lists coupons for this event (fetch list filtered by experienceId). Full CRUD: Add coupon (modal, POST with current eventId), Edit (modal, PUT), Delete (DELETE). Reuse existing discount code modal and table/card components where possible.
- **Venue:** Frontend label/placeholder "Venue" only; API keeps `location`.

### Ticket UI

- Backend keeps field name `label`. All form and display labels say **"Title"** for ticket name.

### Discount code visibility

- New field `isPublic` (default true). Public = show in checkout offers; private = valid only when user enters code. Backend adds field; form (modal) exposes it when creating/editing coupons.

---

## Frontend todos – Event form refactor

### Store and types

- [x] **Store** (`event-form-store.ts`): `TOTAL_STEPS = 4`. Step order: 1 = Media, 2 = Event details, 3 = Tickets, 4 = FAQs + questions + coupons. Add state for coupon drafts (create flow): e.g. `discountCodeDrafts: Array<{ code, type, amount, ... }>`. Basics: keep title, location (venue), description, startDate, endDate, isFreeRsvp, isActive; remove or repurpose single `spotsAvailable` for free RSVP only (Step 2 single "Spots" when isFreeRsvp). Tickets: each ticket has label, price, currency, description?, totalSpots, spotsAvailable (form sets both from one "Spots" input per ticket).
- [x] **Types:** EventFormBasics: no global spotsAvailable for paid path; optional single "spots" for free (e.g. `freeSpots` or reuse `spotsAvailable` only when isFreeRsvp). EventTicket type: add `totalSpots` and `spotsAvailable`. CreateEventPayload: tickets with totalSpots/spotsAvailable; no top-level spotsAvailable (or only for free RSVP); optional `discountCodes?: Array<...>` for create. Client types for discount code create payload include `isPublic` when backend is ready.

### Step components (rename and rewire)

- [x] **Step 1 – Media:** New component (or rename). Content: media upload (existing), Free RSVP toggle. Reads/writes store: media, basics.isFreeRsvp. Back / Next.
- [x] **Step 2 – Event details:** New component. Fields: Event name, Venue (location), Start date+time, End date+time, Description. If isFreeRsvp: one "Spots" input → store in basics (e.g. for later use as free-rsvp ticket spots). If paid: no spots. Back / Next.
- [x] **Step 3 – Tickets:** Shown only when **not** isFreeRsvp. Per ticket: Title (map to/from `label`), Price, Spots (one number → set both totalSpots and spotsAvailable), Description. Add/remove ticket types. When isFreeRsvp: skip step (don’t render or skip on next from Step 2). Back / Next.
- [x] **Step 4 – One last step:** FAQs + Custom questions (existing behaviour) + **Coupons** via **Step4CouponsSection**. Submit only on Step 4. Coupons logic (drafts vs API, modals, list/table) lives in `steps/Step4CouponsSection.tsx`; Step 4 composes it with FAQs and custom questions. Create: discountCodeDrafts in store; edit: list coupons for event, full CRUD (DiscountCodeFormModal, DiscountCodesCards/Table). Step names in header: "Media", "Event details", "Tickets", "One last step".

### EventFormBase and payload

- [x] **EventFormBase:** Renders 4 steps (STEP_NAMES: Media, Event details, Tickets, One last step). Step 3 = Step3TicketsSkip when isFreeRsvp, else Step3Pricing. Step 4 = Step4OneLastStep; submit only there; submit label/loading from mode (create/edit) via SUBMIT_LABELS.
- [x] **Payload builder:** `buildEventCreatePayload` in Step3Pricing. Paid: tickets with label, price, currency, description?, totalSpots, spotsAvailable. Free: one ticket { code: 'free-rsvp', label: 'Free RSVP', price: 0, currency: 'INR', totalSpots, spotsAvailable } from basics.freeSpots. Optional discountCodes; no slug/dateDisplayText.
- [x] **CreateEventForm:** Submit sends payload (Step4 builds it with optional discountCodeDrafts). Success: reset(), invalidate experiences, toast "Event created", router.replace to event landing or /host/experiences. reset() on mount and onSuccess.
- [x] **EditEventForm:** getEvent → setBasics/setMedia/setFaqs/setTickets (totalSpots/spotsAvailable mapped)/setCustomQuestions/setStep(1). Step 4 (Step4CouponsSection) loads coupons via listDiscountCodes(eventId); full CRUD in modal + API. On success: reset(), push to /host/experiences, toast.

### Discount codes list by event

- [x] **List coupons for event:** `listDiscountCodes(token, experienceId)` supports optional experienceId; Step4CouponsSection uses it for edit flow. List shown in Step 4 with Add / Edit / Delete (cards + table + modals).

### Other

- [x] **Checkout / landing:** Ticket display uses `label` from API (EventPricingBar, CheckoutTicketSelection, OrderSummaryCard); event form labels say "Title". Event totalSpots/spotsAvailable (virtuals) already used in EventLandingPage, CheckoutContent, EditEventForm, leads, etc. No change needed.
- [ ] **Leads / analytics:** When backend moves to ticket-level spots and virtuals, event response will still expose totalSpots and spotsAvailable (virtuals). Leads/analytics that show "spots booked / totalSpots" or per-ticket breakdown will need ticket.totalSpots / ticket.spotsAvailable when that’s added to API responses.

---

## Current context (paste before summarization)

- **Event form refactor (done):** 4 steps: Media, Event details, Tickets (when paid), One last step (FAQs, custom questions, **Step4CouponsSection**). Coupons logic extracted to `Step4CouponsSection.tsx` (drafts + modal in create; API list + CRUD in edit). Spots at ticket level; event virtuals. Venue = location in API; ticket UI "Title", backend `label`.
- **Event landing:** EventLandingClient, sticky approval alert, CTA hidden when not approved. Create success → router.replace to event landing.
- **Leads:** GuestDetailsCard shows customAnswers. Export to CSV planned.
- **MAP:** Pending, Hosts, All experiences done; 403 handling.

---

## Reference

- **Backend (after refactor):** Event create payload: tickets with totalSpots, spotsAvailable; optional discountCodes; no event-level spotsAvailable. Event doc: totalSpots/spotsAvailable virtuals. List discount codes: optional ?experienceId=. DiscountCode: isPublic (default true).
- **Reuse:** EventCard, Event-landing for preview; **Step4CouponsSection** encapsulates Step 4 coupons (drafts + DiscountCodeDraftModal in create; API list + DiscountCodeFormModal, DiscountCodesCards/Table in edit). Do not reuse HostShell for MAP.

---

_Last updated: Event form 4-step done; Step 4 coupons extracted to Step4CouponsSection. PROGRESS and context updated._
