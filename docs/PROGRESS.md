# Supersquad client – progress & context

**Purpose:** Single source of truth for progress and understanding. Update this file as we go.

---

## Constraints (do not remove)

1. **Clean, maintainable code** – Follow industry standards; no mess.
2. **PROGRESS.md** – Use this file to record progress and understanding; refer when context is lost.
3. **No hallucinations** – Only state what we can verify from code or PRD.

---

## Output after any code change

After making any change, provide:

- **Summary of changes** with reasoning.
- **Assessment:** Pragmatic, over-engineered, or under-engineered?
- **Alternatives:** Other workarounds (better or worse) we could have taken.

---

## Architecture (PRD v1.7)

**Single app domain:** **app.gosupersquad.com** (one frontend; no separate main vs admin subdomains).

**App folder grouping (for clarity):** Host routes live in `app/host/`. Admin routes will live in `app/admin/`. Public routes (landing, event landing) can live in `app/(public-routes)/` so the three areas stay clearly separated. No requirement to move existing files; use this convention for new routes.

### Public routes

| Route                                  | Renders                          |
| -------------------------------------- | -------------------------------- |
| `/`                                    | Landing page (public, later)     |
| `/hosts/[username]/events/[eventSlug]` | Event landing page (public, SSR) |

### Host routes (host-facing product)

| Route                                          | Renders                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------------------------- |
| `/host/login`                                  | Host login                                                                      |
| `/host/dashboard`                              | Host dashboard – sidebar: Experiences (default), Bookings; future: Coupons etc. |
| `/host/experiences?type=event\|trip`           | Filtered experiences table                                                      |
| `/host/experiences/new?type=event\|trip`       | Create experience                                                               |
| `/host/experiences/[id]/edit?type=event\|trip` | Edit experience                                                                 |
| `/host/bookings`, `/host/coupons`              | Future                                                                          |

### Master Admin (platform admin)

| Route                       | Renders          |
| --------------------------- | ---------------- |
| `/admin/master/`            | Index            |
| `/admin/master/hosts`       | Hosts list       |
| `/admin/master/experiences` | Experiences list |

### robots.txt (REQUIRED)

- **robots.txt** must **Disallow** `/admin/master` so that:
  - Search engines do **not list** these URLs.
  - Bots do **not crawl** or index any page under `/admin/master`.

**Implementation (do not forget):** Serve a robots.txt with at least:

- `User-agent: *`
- `Disallow: /admin/master`
  Either: (1) static file at **public/robots.txt** in the Next.js app, or (2) dynamic route (e.g. **app/robots.ts**) that returns the same. Do this before launch so `/admin/master` is never indexed or crawled.

---

## Phase 1 scope (current)

- **Event only** (no trips): create, read, update (and list).
- **Host:** login, edit (profile/settings).
- **Event landing page:** `/hosts/[username]/events/[eventSlug]` (public, SSR).
- **Mobile-friendly:** all host and admin UIs.
- **robots.txt:** Disallow `/admin/master` (no listing, no crawling).
- Nothing else in Phase 1 (trips, bookings, coupons, checkout, full Master Admin UI later).

---

## Host layout wireframe (agreed)

- **Desktop:** Sidebar (fixed left). Title: "Supersquad Admin". Nav: Experiences (default), later Bookings/Coupons. Logout at bottom of sidebar.
- **Mobile:** Bottom bar. Two items: **Experiences**, **Account** (logout inside; future: edit host personal info).
- **First page:** Dashboard = welcome + quick links. If product owner prefers, can redirect `/host/dashboard` → `/host/experiences`.
- **Active state:** Classy (e.g. subtle bg + border or pill).

---

## Host layout – short tasks

1. **Task 1: Protected host layout** ✅ – Auth guard: `/host/*` except `/host/login` require token; else redirect to `/host/login`. One layout wraps all host routes; login route renders no shell. **Done:** `app/host/layout.tsx` (client): pathname check, token check after mount, redirect if no token; login path renders children only; protected paths show "Loading…" until mounted + token.
2. **Task 2: Desktop sidebar** ✅ – Sidebar with "Supersquad Admin", nav (Experiences, later Bookings/Coupons), logout. Wraps main content; visible on `md+`. **Done:** `HostShell.tsx` (desktop sidebar, fixed left, hidden on mobile); layout wraps protected children in `HostShell`; placeholder `/host/experiences` page.
3. **Task 3: Mobile bottom bar** ✅ – Bottom bar with Experiences, Account (logout on Account page; future: edit host). Visible on `< md`. **Done:** `HostShell.tsx` mobile nav (fixed bottom, `md:hidden`), two items with active state; `main` has `pb-16` on mobile; `/host/account` page with Logout (and user name/email; future: edit profile).
4. **Task 4: Dashboard welcome** ✅ – Dashboard page: welcome + quick links (or redirect to `/host/experiences` if PO prefers). **Done:** `app/host/dashboard/page.tsx` (client): welcome with user name from store; quick links to Experiences, More, Account; note that redirect can be added later. `app/host/dashboard/layout.tsx` for metadata (title/description).
5. **Task 5: Active nav state** – Skipped; current styles are fine.
6. **Task 6: Theme toggle** ✅ – Dark/light toggle. **Done:** `next-themes` + `ThemeProvider` (root layout, default dark); `ThemeToggle` component (Sun/Moon icon); desktop: right end of sidebar title "Supersquad Admin"; mobile: Account page tile "Appearance" with toggle.

Reference (design only): `trip-page/client` (admin branch) – AdminLayout.

---

## Component format (preferred)

Use `const ComponentName = () => {}` and `export default ComponentName` for components.

---

## Current work: Host layout tasks done; next as needed

**Backend (existing):** `POST /api/v1/auth/login` – body `{ email, password }`; returns `{ data: { token, user: { id, name, username, email } } }`. Validation: email, password min 6 chars.

**Client (done):**

- **shadcn:** Added `button`, `input`, `card`, `label`, `form` (design reference: `trip-page/client` AdminLogin; rewritten with shadcn).
- **lib/api-client.ts** – `getApiBaseUrl()` (uses `NEXT_PUBLIC_API_URL`, default `http://localhost:3001/api/v1`).
- **lib/auth-client.ts** – `login(email, password)` calls backend, returns `LoginResult`; throws on error.
- **store/auth-store.ts** – Zustand store with `token`, `user`, `setAuth`, `clearAuth`; persisted to localStorage (`supersquad-host-auth`).
- **app/host/login/page.tsx** – Host login page; renders `HostLoginForm`.
- **components/host/HostLoginForm.tsx** – Client form: email, password; react-hook-form + zod; on success `setAuth` + `router.replace("/host/dashboard")`; Card + Form + Input + Button; error state; mobile-friendly (centered, max-width, padding).
- **app/host/dashboard/page.tsx** – Placeholder dashboard so login redirect does not 404.

**Env:** `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1` in `.env` (client).

**Next:** Event create (multi-step form) → Experiences table.

---

## Event creation: multi-step form (planned)

**Route:** `/host/experiences/new?type=event`. Same form component used for edit at `/host/experiences/[id]/edit?type=event` with `mode: "create" | "edit"` (edit pre-fill later).

**Host:** No host selection step; host = logged-in user (`hostId` from auth). Backend uses `req.userId` for `hostId`.

**Steps (4 steps, one per screen on mobile; Next/Back + progress indicator):**

| Step  | Name        | Fields                                                                                                                                                                                                                                                                                                | Notes                                                            |
| ----- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| **1** | **Basics**  | Title (required), Slug (optional; server auto-generates from title if empty), Location (required), Description (required, textarea), Spots available (number ≥ 0), Start date, End date, Date display text (optional, e.g. "March 15–17"), Active (boolean; default true; or "Save as draft" = false) | Single scrollable step on mobile; keep fields in one column.     |
| **2** | **Media**   | Event images (multiple, ordered; upload → get URLs), Optional event video (one; upload → URL). Backend expects `media: { url, type: 'image' \| 'video' }[]`.                                                                                                                                          | Upload UI; add/remove/reorder; then pass URLs in create payload. |
| **3** | **FAQs**    | Q&A pairs: question + answer (both required). Add/remove pairs; default 0. Backend: `faqs: { question, answer }[]`.                                                                                                                                                                                   | Simple list: add row, remove row; no need for many at once.      |
| **4** | **Pricing** | Price (number ≥ 0, required), Currency: INR (fixed for MVP). Checkout banner image = future.                                                                                                                                                                                                          | Single small step.                                               |

**Mobile-friendly:** One step per view on small screens; stepper/progress (e.g. "Step 2 of 4"); Next and Back; optional "Save draft" at end (sets `isActive: false`) or leave always active. No single long page to reduce overwhelm and bounces.

**Form component:** One combined form that accepts `mode: "create" | "edit"`. Create: submit to `POST /api/v1/experiences` (auth = host). Edit: prefill from event (later), submit to `PUT /api/v1/experiences/:id`. Shared validation and step logic.

**Persistence (mobile-friendly):** Use Zustand for step + form state, with **persist** (localStorage). Each step saves to the store so refresh or leaving the page doesn’t lose data. On the **final step** we POST the full payload to the backend; no per-step API calls.

**POST / create:** Use **TanStack Query’s useMutation** for create (and later update). Why: loading/error state out of the box, and we can invalidate the experiences list query on success so the table updates. The actual HTTP call stays in **lib** (axios) for consistency with auth-client: e.g. `lib/experiences-client.ts` has `createEvent(payload)` that does `axios.post(..., payload)` with `Authorization: Bearer <token>`. Component calls `useMutation({ mutationFn: createEvent, onSuccess: () => { queryClient.invalidateQueries(...); router.push(...); } })`. **Fetch list:** useQuery for the experiences table (dashboard) as planned.

**Backend reference:** Routes: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PUT /:id/toggle-status` (all under `/api/v1/experiences`, requireAuth). Validation: createEventSchema (title, slug optional, location, description, spotsAvailable, startDate, endDate, dateDisplayText optional, media array, faqs array, pricing). Server fixes slug from title if slug empty; media is `{ url, type: 'image'|'video' }[]`.

**Implementation order (suggested):** 1) Route + shell (new page with step state). 2) Step 1 (Basics) + Zustand store with persist + client validation. 3) Step 4 (Pricing) so we can build full payload. 4) Step 2 (Media) + upload. 5) Step 3 (FAQs). 6) Wire create (useMutation + lib createEvent); then edit mode + prefill.

**Step 1 done:** Route `/host/experiences/new?type=event`, `EventFormShell` (stepper, Cancel, Step X of 4), `Step1Basics` (title, slug, location, description, spots, start/end date in **DD/MM/YYYY** format, dateDisplayText, isActive). Validation: start date cannot be in the past; end date must be after start date. Store/API still use YYYY-MM-DD; display/input use DD/MM/YYYY. Zustand `event-form-store` with persist (localStorage). `lib/experiences-client.ts` has `createEvent(payload, token)`. "Create event" button on experiences page.

**Step 2 done:** `Step2Media` (Media step). Single **drag-and-drop** area via `react-dropzone`: "Drag & drop files here, or click to select"; supports images (JPG, PNG, GIF, WebP) and videos (MP4, WebM, MOV). `lib/upload-client.ts`: only `uploadMedia`; **no `Content-Type` header** so axios sets `multipart/form-data` with boundary (fixes "No files uploaded"). Step shows current media list (thumbnail + type + remove); Back/Next. Toasts on success/error.

**Step 3 done:** `Step3Faqs` (FAQs step). List of FAQ rows (question + answer); Add FAQ, Remove per row. Validation on Next: if any row has empty question or answer, toast error; else nextStep(). Back/Next. Store: faqs, setFaqs.

**Step 4 done:** `Step4Pricing` (Pricing step). Price (number ≥ 0, required), Currency: INR (fixed). **Create flow wired:** "Create event" button uses `useMutation`; payload built from store (basics, media, faqs, pricing) via `buildPayload`; `createEvent(payload, token)` from `lib/experiences-client`. On success: `reset()` store, `queryClient.invalidateQueries({ queryKey: ['experiences'] })`, `router.push('/host/experiences')`, toast "Event created". On error: toast. `QueryProvider` (TanStack Query) wraps app in root layout.

---

## Experiences list table (step-by-step checklist)

**Scope:** `/host/experiences` – list current host’s events only (events only, no trips). Design reference: `trip-page/client` AdminTrips. Same behaviour: search (fuzzy), table (Title, Status toggle, Spots, Dates, Duration, Actions Edit), loading/empty states, toggle status → API + invalidate + toast.

**API (existing):** `GET /api/v1/admin/experiences` (list by host), `PUT /api/v1/admin/experiences/:id/toggle-status`. Base path: `getApiBaseUrl() + '/admin/experiences'`.

| Step  | Task                                                                                                                                                                                                                 | Status  |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **1** | Extend `lib/experiences-client.ts`: add `listEvents(token)` (GET), add `toggleEventStatus(id, token)` (PUT). Ensure `createEvent` uses `${base}/admin/experiences` (already correct).                                | Done    |
| **2** | Add shadcn UI: `table`, `switch`, `tooltip`. Install `fuse.js` for client-side fuzzy search.                                                                                                                         | Done    |
| **3** | Build `ExperiencesTable` component: columns Title, Status (Switch + badge), Spots, Dates, Duration, Actions (Edit). Use date-fns for dates; duration helper (X days or "-").                                         | Done    |
| **4** | Convert `app/host/experiences/page.tsx` to client: `useQuery` listEvents, search state + Fuse (title, slug), loading/empty states, render ExperiencesTable; toggle status `useMutation` + invalidateQueries + toast. | Done    |
| **5** | (Optional) Edit link → `/host/experiences/[id]/edit?type=event`; add placeholder edit page if needed. View live link if API returns host username later.                                                             | Pending |

**Future: trips + combined list (not implemented yet).** Keep two separate list functions: `listEvents(token)` and later `listTrips(token)` — two collections, different logic; no `listExperiences(type)`. Combined view: fetch both in parallel (`Promise.all([listEvents, listTrips])`), normalize with discriminator (e.g. `kind: 'event' | 'trip'`), sort by `updatedAt` desc, render one table. URL: `?type=event` (events only), `?type=trip` (trips only), `?type=event,trip` (combined). Current work: events-only flow only.

---

## Toasts (react-hot-toast)

- **Unauthenticated on protected route:** "Please sign in to continue" (host layout, before redirect).
- **Login success:** "Signed in successfully" (HostLoginForm, after setAuth). Kept to one success toast to avoid spam.
- Toaster in root layout (`top-center`, 4s duration).

---

## Conventions

- **Custom components:** Any new custom components go in `components/custom/`, not `components/ui/` (ui is reserved for shadcn). Only `required-mark` lives in custom; form fields are inlined in Step1Basics (no form-field-input / form-field-textarea).
- **Upload:** Client uses only `POST /api/v1/upload/media` (field `files`, array). Server single-image and single-video routes are commented out; only `/media` is active.

---

## Mobile "More" tab

- Bottom bar has **Experiences**, **More**, **Account**. **More** → `/host/more` page with links to Leads, Coupons (placeholder "coming soon"), etc. Keeps the bar to 3 tabs; extra items live under More. Add more links on the More page as features ship.

---

_Last updated: Experiences list Step 4 done — experiences page with useQuery, Fuse search, ExperiencesTable, toggle mutation + toast._
