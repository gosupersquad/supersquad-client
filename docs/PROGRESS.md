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

- **MAP All experiences page:** `app/admin/master/experiences/page.tsx`. useQuery `listAllExperiences(token)` (GET experiences?approvalStatus=all). Desktop: Table (Title, Host, Spots left spotsAvailable/totalSpots, Dates, Duration, Actions = View live to `/hosts/{host.username}/events/{slug}`). Mobile: EventCard with `toEventCardData`, `hostName={event.host.name}`, `location: event.location ?? ""`. Fuse search keys: title, slug, host.name, host.username. No table column for location; location only in card view.
- **Server:** `listForMaster(approvalStatus)` and `listAllForMaster()`; both return MasterEventListItem with id, title, slug, **location**, host, approvalStatus, spotsAvailable, **totalSpots**, startDate, endDate, createdAt, media. Controller: approvalStatus === 'all' → listAllForMaster(), else listForMaster(approvalStatus ?? 'pending').
- **EventCard:** Optional prop `hostName?: string | null`; when set, show host name below title (admin/master view). Location from event card data (used in MAP cards).
- **Master event list type:** `MasterEventListItem` in `lib/master-admin/experiences-client.ts` has location, totalSpots. `listAllExperiences(token)` calls API with params approvalStatus: 'all'.

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

## Todos / next (high level)

- Trips (when in scope).
- Any further MAP or host polish as needed.

---

## Reference

- **Backend MAP:** GET .../experiences?approvalStatus=pending|approved|rejected|**all**, GET .../experiences/count, GET .../experiences/:id, PATCH .../experiences/:id/approval. GET .../hosts, GET .../hosts/:id, POST/PUT .../hosts. All require Bearer + role=master.
- **Host list/get:** Include approvalStatus, rejectedReason.
- **Reuse:** EventCard (with optional hostName), Event-landing for preview; do not reuse HostShell for MAP.

---

_Last updated: MAP All experiences done (table + cards, Fuse, location in list + EventCard hostName). Host deactivation + QueryProvider 403 handling. FINAL_IMPLEMENTATION_PLAN v1.21._
