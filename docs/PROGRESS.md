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

- **Event create/edit flow (unified):** **3 steps** – (1) Basics + media (title, location, description, start/end datetime, media max 6; no slug, dateDisplayText, isActive in form). (2) Tickets + capacity: **isFreeRsvp** switch, tickets screen, **spotsAvailable** (capacity). (3) FAQs + custom questions. Create → on success redirect to event landing. Edit uses same 3 steps (mimics create). Drop **dateDisplayText** from flow.
- **Event landing + host preview:** Backend: `GET /hosts/:username/events/:eventSlug` – if **Authorization present and requester is host owner**, return event in **any** approval state. If **no token (public)**, return event only when `approvalStatus === 'approved'`. Frontend: event landing page – if token present and host is owner, show **sticky alert (top-center)**: pending = "Under review"; rejected = different copy; approved = public (no alert). Public sees page only when approved.
- **MAP All experiences:** Desktop MasterExperiencesTable (Approval select, View live); mobile EventCard; Fuse search. List API `approvalStatus=all`; list includes location, totalSpots, approvalStatus.

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

## Todos – Event create/edit flow + landing (actionable)

**Backend**

| #   | Task                                                                                                                                                                                                                                                                                                                 | Status |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| BE1 | **Public event GET:** `GET /api/v1/hosts/:username/events/:eventSlug`. If request has `Authorization` and the authenticated user is the **host owner** of this event, return the event in **any** approval state. If no auth (public), return event only when `approvalStatus === 'approved'` (else 404 or no body). | [ ]    |
| BE2 | Optional: In `server/src/models/event.model.ts`, add short comments for fields not collected in new create form (e.g. slug server-generated, isActive default, dateDisplayText dropped). No schema change, no removal.                                                                                               | [ ]    |

**Frontend – Form (create + edit same 3 steps)**

| #   | Task                                                                                                                                                                                                                                                         | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| FE1 | **Store:** `event-form-store.ts` – set `TOTAL_STEPS = 3`. Defaults: remove `slug`, `dateDisplayText`, `isActive` from basics (or keep in type but never set from form). Step order: 1 = basics + media, 2 = tickets + capacity, 3 = faqs + custom questions. | [ ]    |
| FE2 | **Step 1 (Basics + media):** One step with title, location, description, start datetime, end datetime, media upload **max 6**. Reuse/merge Step1Basics + Step2Media; remove slug, dateDisplayText, isActive from UI and validation.                          | [ ]    |
| FE3 | **Step 2 (Tickets + capacity):** isFreeRsvp switch, tickets screen (add/remove, label, price), **spotsAvailable** (capacity) input. Reuse logic from Step4Pricing; submit stays on step 3.                                                                   | [ ]    |
| FE4 | **Step 3 (FAQs + questions):** FAQs + custom questions in one step. Submit: build payload from store, call create/update API. Create success → redirect to event landing. Edit success → redirect to experiences or success toast (decide and document).     | [ ]    |
| FE5 | **EventFormBase:** Render 3 steps only; step names e.g. "Basics & media", "Tickets & capacity", "FAQs & questions". **Edit flow:** Load event into store; same 3 steps; submit = update API.                                                                 | [ ]    |
| FE6 | **Payload builder:** Build create/update payload from store. Omit slug, dateDisplayText. Send spotsAvailable; server sets totalSpots = spotsAvailable on create. Include isFreeRsvp, tickets, media, faqs, customQuestions.                                  | [ ]    |

**Frontend – Event landing (host preview + alert)**

| #   | Task                                                                                                                                                                                                                                                                                                                                                                                                   | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| FE7 | **Event landing page** (`/hosts/[username]/events/[eventSlug]`): If **token present** and current user is **host owner (or master admin)** of this event, fetch event (backend returns any state). Show **sticky alert (top-center)**: pending → "Under review"; rejected → "Rejected" + optional reason; approved → no alert. No token or not owner → current behaviour (public: only when approved). | [ ]    |

**Reference**

- **Server:** `POST /api/v1/admin/experiences` – CreateEventPayload (slug optional). `GET /api/v1/hosts/:username/events/:eventSlug` – with auth + owner → any state; without auth → approved only.
- **Client:** `EventFormBase` + 3 steps; store TOTAL_STEPS = 3. Create → submit from step 3 → redirect to event landing. Edit → same 3 steps, submit = update. Event landing: host owner + token → sticky alert by approvalStatus; public → approved only.

---

## Todos / next (high level)

- Event create/edit flow (3 steps) + event landing host preview (sticky alert, backend conditional GET).
- Trips (when in scope).
- Any further MAP or host polish as needed.

---

## Reference

- **Backend MAP:** GET .../experiences?approvalStatus=pending|approved|rejected|**all**, GET .../experiences/count, GET .../experiences/:id, PATCH .../experiences/:id/approval. GET .../hosts, GET .../hosts/:id, POST/PUT .../hosts. All require Bearer + role=master.
- **Host list/get:** Include approvalStatus, rejectedReason.
- **Reuse:** EventCard (with optional hostName), Event-landing for preview; do not reuse HostShell for MAP.
- **Event landing GET:** With token + host owner → return event any approval state. No token → return only when approved. Event landing UI: host owner sees sticky alert (pending/rejected copy); approved or public sees no alert.

---

_Last updated: Event create/edit 3-step flow + landing host preview. Actionable todos BE1–BE2, FE1–FE7._
