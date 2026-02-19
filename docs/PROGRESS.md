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

- **Host:** Login, layout (guard + HostShell), dashboard, experiences list (table + cards, search, toggle status, edit, view live), event create/edit (4-step form, media upload, discount codes in checkout), discount codes CRUD, leads (list + detail, Confirmed/Abandoned toggle).
- **Public:** Event landing (SSR), checkout (tickets, attendees, coupons, Pay & Reserve / free RSVP), payment status page (verify, order summary).
- **Auth:** Login with role; redirect by role; store has `role` for refresh/guards.

---

## Frontend work – MAP & approval status (actionable todos)

Use this list step-by-step; tick and review as we go. Order is intentional.

### A. Types & data (client)

| #   | Task                                                                                                                                                                                                                                                                                 | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| A1  | Add `approvalStatus` and `rejectedReason` to `EventResponse` in `lib/experiences-client.ts` (or shared event type) so host list/get responses are typed.                                                                                                                             | [x]    |
| A2  | Create **master API client** (e.g. `lib/master-experiences-client.ts`): `listPendingExperiences(token)`, `getPendingCount(token)`, `getExperienceForPreview(id, token)`, `setApproval(id, { approved, rejectedReason? }, token)`. Use `getApiBaseUrl()` and `Authorization: Bearer`. | [x]    |

### B. MAP layout & guard

| #   | Task                                                                                                                                                                                                                                 | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| B1  | Create `app/admin/master/layout.tsx` (client): After mount, if no token → `router.replace('/host/login')`; if token and `role !== 'master'` → `router.replace('/host/dashboard')`. Else render MAP shell (header + tabs + children). | [x]    |
| B2  | MAP shell: Tabs **Pending approval** (with badge count), **Experiences** (disabled/placeholder), **Hosts** (disabled/placeholder). Badge from `getPendingCount`. Content area = `children`.                                          | [x]    |
| B3  | `app/admin/master/page.tsx`: Redirect to `/admin/master/pending` or show minimal dashboard.                                                                                                                                          | [x]    |

### C. Pending approval tab

| #   | Task                                                                                                                                                                                                             | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| C1  | `app/admin/master/pending/page.tsx`: useQuery list (`listPendingExperiences`), useQuery count (`getPendingCount`). Loading/empty states.                                                                         | [x]    |
| C2  | Cards (not table): image, Title, Host, **Preview** (link), **Approve** (green), **Reject** (→ confirm + reason). Fuse search by title/slug/host. Title, description, padding aligned with host experiences page. | [x]    |
| C3  | Reject: `window.confirm` before reject; then `window.prompt` for optional reason → setApproval(approved: false, rejectedReason) → invalidate → toast.                                                            | [x]    |

### D. Preview page

| #   | Task                                                                                                                                                                                                   | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| D1  | `app/admin/master/experiences/[id]/preview/page.tsx`: useParams id, useQuery `getExperienceForPreview(id)`.                                                                                            | [x]    |
| D2  | Render **same event-landing component** as public event page; pass event from MAP API. Optional: hide or disable "Book" / checkout CTA for preview. "Back to Pending" link to `/admin/master/pending`. | [x]    |

### E. Host dashboard – approval status

| #   | Task                                                                                                                                                                                                 | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| E1  | **ExperiencesTable:** Add column **Approval** (or integrate into Status): badge Pending (amber), Rejected (show `rejectedReason` in tooltip), Approved (green). Data already in event from list API. | [x]    |
| E2  | **ExperiencesCards:** Add small approval badge per card (Pending / Rejected / Approved); Rejected: show reason on hover or under badge.                                                              | [x]    |

### F. Polish & review

| #   | Task                                                                                                                                    | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F1  | 403 from MAP API (e.g. host hits master endpoint): redirect to `/host/dashboard` and toast "Access denied".                             | [x]    |
| F2  | Review: no duplicate logic; event-landing reused for preview; one master client module; host table/cards only get one new column/badge. | [x]    |

---

## Reference (for implementation)

- **Backend MAP APIs:** `GET .../admin/master/experiences?approvalStatus=pending`, `GET .../experiences/count?approvalStatus=pending`, `GET .../experiences/:id`, `PATCH .../experiences/:id/approval` (body: `{ approved, rejectedReason? }`). All require Bearer token and role = master.
- **Host list/get:** Responses include `approvalStatus` and `rejectedReason` (server already returns them).
- **Reuse:** Event-landing component for MAP preview; host table/card design system; auth store and redirect pattern. Do **not** reuse HostShell for MAP (different nav); build minimal MAP shell with tabs only.

---

_Last updated: C1–C3 done (pending page cards, search, reject confirm + reason). robots.txt disallow /admin/master and /host/, allow public routes._
