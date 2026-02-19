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
- **robots.txt:** Must **Disallow** `/admin/master`. Static file or `app/robots.ts`.

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
| B1  | Create `app/admin/master/layout.tsx` (client): After mount, if no token → `router.replace('/host/login')`; if token and `role !== 'master'` → `router.replace('/host/dashboard')`. Else render MAP shell (header + tabs + children). | [ ]    |
| B2  | MAP shell: Tabs **Pending approval** (with badge count), **Experiences** (disabled/placeholder), **Hosts** (disabled/placeholder). Badge from `getPendingCount`. Content area = `children`.                                          | [ ]    |
| B3  | `app/admin/master/page.tsx`: Redirect to `/admin/master/pending` or show minimal dashboard.                                                                                                                                          | [ ]    |

### C. Pending approval tab

| #   | Task                                                                                                                                                                                                                            | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| C1  | `app/admin/master/pending/page.tsx`: useQuery list (`listPendingExperiences`), useQuery count (`getPendingCount`). Loading/empty states.                                                                                        | [ ]    |
| C2  | Table: columns Title, Host (name/username), Dates, Actions. Actions: **Preview** (link to preview page), **Approve** (button → setApproval approved: true → invalidate list + count → toast), **Reject** (button → open modal). | [ ]    |
| C3  | Reject modal: optional "Reason" text input; Confirm → setApproval(approved: false, rejectedReason) → invalidate → toast; Cancel closes.                                                                                         | [ ]    |

### D. Preview page

| #   | Task                                                                                                                                                                                                   | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| D1  | `app/admin/master/experiences/[id]/preview/page.tsx`: useParams id, useQuery `getExperienceForPreview(id)`.                                                                                            | [ ]    |
| D2  | Render **same event-landing component** as public event page; pass event from MAP API. Optional: hide or disable "Book" / checkout CTA for preview. "Back to Pending" link to `/admin/master/pending`. | [ ]    |

### E. Host dashboard – approval status

| #   | Task                                                                                                                                    | Status                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- | --- |
| E1  | **ExperiencesTable:** Add column **Approval** (or integrate into Status): badge Pending (e.g. amber)                                    | Rejected (show `rejectedReason` in tooltip or subtitle) | Approved (e.g. green). Data already in event from list API. | [ ] |
| E2  | **ExperiencesCards:** Add small approval badge per card (Pending / Rejected / Approved); Rejected: show reason on hover or under badge. | [ ]                                                     |

### F. Polish & review

| #   | Task                                                                                                                                    | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F1  | 403 from MAP API (e.g. host hits master endpoint): redirect to `/host/dashboard` or show "Access denied". Optional.                     | [ ]    |
| F2  | Review: no duplicate logic; event-landing reused for preview; one master client module; host table/cards only get one new column/badge. | [ ]    |

---

## Reference (for implementation)

- **Backend MAP APIs:** `GET .../admin/master/experiences?approvalStatus=pending`, `GET .../experiences/count?approvalStatus=pending`, `GET .../experiences/:id`, `PATCH .../experiences/:id/approval` (body: `{ approved, rejectedReason? }`). All require Bearer token and role = master.
- **Host list/get:** Responses include `approvalStatus` and `rejectedReason` (server already returns them).
- **Reuse:** Event-landing component for MAP preview; host table/card design system; auth store and redirect pattern. Do **not** reuse HostShell for MAP (different nav); build minimal MAP shell with tabs only.

---

_Last updated: Added MAP & approval status actionable todos; trimmed old narrative; kept constraints, conventions, architecture summary._
