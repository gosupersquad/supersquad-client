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

- **Host:** Login, layout (guard + HostShell), dashboard, experiences list (table + cards, Fuse search, toggle status, edit, view live), approval column + badges (ApprovalBadge; Rejected + reason via Dialog), event create/edit (4-step form), discount codes CRUD, leads (list + detail, Confirmed/Abandoned toggle).
- **Public:** Event landing (SSR), checkout, payment status page (verify, order summary).
- **MAP:** Pending (cards, Fuse search, approve/reject, preview link); Preview page (event landing, pricing bar disabled); **Hosts** (list cards, Fuse name/username, Create/Update modals via HostFormBase + CreateHostForm/EditHostForm, isActive toggle); **All experiences** (`/admin/master/experiences` – table desktop, cards mobile, Fuse search title/slug/host, View live only; list API `approvalStatus=all`; list includes location + totalSpots); 403 → redirect + toast.
- **Auth:** Host deactivation: server `requireAuth` re-checks Host.isActive for role=host → 403 "account deactivated"; client QueryProvider QueryCache/MutationCache onError → clearAuth, toast, router.push('/host/login').

---

## Current context (paste before summarization)

- **Event form (implemented):** See **Implemented – Event create/edit flow (3 steps)** below. Store 3 steps; EventFormBase uses `mode`; submit labels from mode; Step4Pricing = step 2 only (Next); Step3Faqs = step 3 only (Submit). No slug/dateDisplayText in type or payload; isActive in store for edit.
- **Event landing + host preview (FE7 done):** Client fetch via EventLandingClient with optional token; owner/master see any state. Sticky approval alert (pending/rejected); pricing CTA hidden when not approved. Create success: toast then router.replace to event landing; back does not return to create form.
- **Leads:** GuestDetailsCard shows customAnswers. Export to CSV planned (client-side; current view; fixed + dynamic custom question columns).
- **MAP All experiences:** MasterExperiencesTable, EventCard, Fuse; list `approvalStatus=all`.

---

## Frontend work – MAP & approval (done)

| #     | Task                                                                                                                                           | Status |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| A1    | approvalStatus/rejectedReason on EventResponse; master client (listPendingExperiences, getPendingCount, getExperienceForPreview, setApproval). | [x]    |
| A2    | (same)                                                                                                                                         | [x]    |
| B1–B3 | MAP layout, guard, tabs (Pending, Experiences, Hosts), badge count.                                                                            | [x]    |
| C1–C3 | Pending page: list, count, cards, Preview/Approve/Reject, Fuse search.                                                                         | [x]    |
| D1–D2 | Preview page: same event landing, pricing bar disabled.                                                                                        | [x]    |
| E1–E2 | Host table/cards: Approval column + ApprovalBadge; Rejected + reason Dialog.                                                                   | [x]    |
| F1–F2 | 403 MAP → redirect + toast; review.                                                                                                            | [x]    |

---

## MAP – Host CRUD (done)

- **Plan:** [PROGRESS-MAP-HOSTS.md](./PROGRESS-MAP-HOSTS.md). F1–F6 done. Hosts list, Create/Update modals, HostFormBase + CreateHostForm/EditHostForm, isActive toggle, Fuse search (name/username).

---

## MAP – All experiences (done)

- **Page:** `/admin/master/experiences`. List all events (all hosts). Table (desktop), cards (mobile), Fuse search, View live only. API: GET experiences?approvalStatus=all; list includes location + totalSpots. EventCard receives hostName for admin view.

---

## Implemented – Event create/edit flow (3 steps)

**Preserve this section; it is the source of truth for the current form implementation.**

- **Store** (`event-form-store.ts`): `TOTAL_STEPS = 3`. `defaultBasics`: title, location, description, spotsAvailable (0), startDate, endDate, isFreeRsvp (false), isActive (true). No slug, no dateDisplayText in defaults. Step order: 1 = basics + media, 2 = tickets + capacity, 3 = faqs + custom questions.
- **Types** (`types/index.ts`): `EventFormBasics` has title, location, description, spotsAvailable, startDate, endDate, isFreeRsvp?, isActive?. No slug, no dateDisplayText (never set on frontend). isActive kept for edit form.
- **EventFormBase**: Props: `mode: "create" | "edit"`, `onSubmit`, `isSubmitting`. Submit labels are **not** passed from parent; derived via `SUBMIT_LABELS[mode]` (create: "Create event" / "Creating…", edit: "Update event" / "Updating…"). Step 1: `<Step1Basics mode={mode} />`. Step 2: `<Step4Pricing />` (no props). Step 3: `<Step3Faqs onSubmit submitLabel submitLoadingLabel isSubmitting />` (labels from SUBMIT_LABELS[mode]).
- **Step4Pricing**: Used only as **step 2**. No props. Renders: tickets, capacity (spotsAvailable), isFreeRsvp, CustomQuestionsSection; footer = Back + **Next** only (no Submit, no `isLastStep`). Exports `buildEventCreatePayload(basics, media, faqs, tickets, customQuestions)`; payload does **not** include slug or dateDisplayText.
- **Step3Faqs**: Used only as **step 3**. Required props: `onSubmit`, `submitLabel`, `submitLoadingLabel`, `isSubmitting`. Renders: FAQs, CustomQuestionsSection; footer = Back + **Submit**. Validates FAQs, tickets, custom questions; builds payload via `buildEventCreatePayload`; calls `onSubmit(payload)`.
- **CreateEventForm / EditEventForm**: Pass to EventFormBase only `mode`, `onSubmit`, `isSubmitting`. Do not pass submitLabel or submitLoadingLabel.
- **EditEventForm** `setBasics`: Sets title, location, description, spotsAvailable, startDate, endDate, isFreeRsvp, isActive. Does **not** set slug or dateDisplayText.
- **Design rule:** One role per step. Step 2 never submits; no conditional "last step" flag. Submit only on step 3.

---

## Todos – Event create/edit flow + landing (actionable)

**Backend**

| #   | Task                                                                                                                                                                                                                                                                                                                                 | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| BE1 | **Public event GET:** `GET /api/v1/hosts/:username/events/:eventSlug`. If request has `Authorization` and the authenticated user is the **host owner** of this event or master admin, return the event in **any** approval state. If no auth (public), return event only when `approvalStatus === 'approved'` (else 404 or no body). | [x]    |
| BE2 | Optional: In `server/src/models/event.model.ts`, add short comments for fields not collected in new create form (e.g. slug server-generated, isActive default, dateDisplayText dropped). No schema change, no removal.                                                                                                               | [x]    |

**Frontend – Form (create + edit same 3 steps)**

| #   | Task                                                                                                                                                                                                                                                         | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| FE1 | **Store:** `event-form-store.ts` – set `TOTAL_STEPS = 3`. Defaults: remove `slug`, `dateDisplayText`, `isActive` from basics (or keep in type but never set from form). Step order: 1 = basics + media, 2 = tickets + capacity, 3 = faqs + custom questions. | [x]    |
| FE2 | **Step 1 (Basics + media):** One step with title, location, description, start datetime, end datetime, media upload **max 6**. Reuse/merge Step1Basics + Step2Media; remove slug, dateDisplayText, isActive from UI and validation.                          | [x]    |
| FE3 | **Step 2 (Tickets + capacity):** isFreeRsvp switch, tickets screen (add/remove, label, price), **spotsAvailable** (capacity) input. Reuse logic from Step4Pricing; submit stays on step 3.                                                                   | [x]    |
| FE4 | **Step 3 (FAQs + questions):** FAQs + custom questions in one step. Submit: build payload from store, call create/update API. Create success → redirect to event landing with sticky success alert. Edit success → redirect to experiences + toast.          | [x]    |
| FE5 | **EventFormBase:** Render 3 steps only; step names e.g. "Basics & media", "Tickets & capacity", "FAQs & questions". **Edit flow:** Load event into store; same 3 steps; submit = update API.                                                                 | [x]    |
| FE6 | **Payload builder:** Build create/update payload from store. Omit slug, dateDisplayText. Send spotsAvailable; server sets totalSpots = spotsAvailable on create. Include isFreeRsvp, tickets, media, faqs, customQuestions.                                  | [x]    |

**Frontend – Event landing (host preview + alert)**

| #   | Task                                                                                                                                                                                                                                                                                                                                                                                        | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FE7 | **Event landing page** (`/hosts/[username]/events/[eventSlug]`): If **token present** and current user is **host owner** of this event or master admin, fetch event (backend returns any state). Show **sticky alert (top-center)**: pending → "Under review"; rejected → "Rejected" + optional reason; approved → no alert. Pricing CTA hidden when approvalStatus is pending or rejected. | [x]    |

**Reference**

- **Server:** `POST /api/v1/admin/experiences` – CreateEventPayload (slug optional). `GET /api/v1/hosts/:username/events/:eventSlug` – optionalAuth; owner or master → any state; no auth → approved only.
- **Client:** See **Implemented – Event create/edit flow (3 steps)** for store, EventFormBase, Step4Pricing, Step3Faqs, CreateEventForm, EditEventForm. Create success → toast "Event created" then **router.replace** to event landing (no query param); edit success → router.replace to `/host/experiences` + toast. Event landing: **EventLandingClient** fetches with `getPublicEvent(username, eventSlug, token)`; sticky approval alert; CTA hidden when not approved. Leads: GuestDetailsCard shows customAnswers; export to CSV planned.

---

## Todos / next (high level)

- **Leads export to CSV:** Client-side export of current view's leads (filteredAttendees or attendeesByView); fixed columns (name, email, phone, instagram, ticket, booking id, payment status, total, createdAt) + dynamic columns from customAnswers keys; e.g. @json2csv/plainjs; download filename `leads-{slug}-{date}.csv`.
- Trips (when in scope).
- Any further MAP or host polish as needed.

---

## Reference

- **Backend MAP:** GET .../experiences?approvalStatus=pending|approved|rejected|**all**, GET .../experiences/count, GET .../experiences/:id, PATCH .../experiences/:id/approval. GET .../hosts, GET .../hosts/:id, POST/PUT .../hosts. All require Bearer + role=master.
- **Host list/get:** Include approvalStatus, rejectedReason.
- **Reuse:** EventCard (with optional hostName), Event-landing for preview; do not reuse HostShell for MAP.
- **Event landing GET:** With token + host owner → return event any approval state. No token → return only when approved. Event landing UI: host owner sees sticky alert (pending/rejected copy); approved or public sees no alert.

---

_Last updated: FE1–FE7 done. Create success → toast + router.replace to event landing. Event landing: client fetch (EventLandingClient) with optional token; sticky approval alert; CTA hidden when not approved. Leads: GuestDetailsCard shows customAnswers; export to CSV planned (client-side)._
