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
| `/host/discount-codes`                         | Discount codes CRUD (list, create, edit, toggle, delete)                        |
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
- **Discount codes (host):** full CRUD — list, create, edit, toggle status, delete. v1: flat (₹) only; no event-scoping (experienceId) in UI; code read-only on edit.
- **Event landing page:** `/hosts/[username]/events/[eventSlug]` (public, SSR).
- **Mobile-friendly:** all host and admin UIs.
- **robots.txt:** Disallow `/admin/master` (no listing, no crawling).
- Nothing else in Phase 1 (trips, bookings, checkout, full Master Admin UI later).

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
| **4** | **Pricing** | **Ticket-level:** at least one ticket type (label + price, currency INR). Optional custom questions for attendees (label + required). Backend: `tickets: { code, label, price, currency }[]`, `customQuestions: { label, required }[]`. Code is client-generated from label (slugify + dedupe).       | Add/remove tickets and custom questions.                         |

**Mobile-friendly:** One step per view on small screens; stepper/progress (e.g. "Step 2 of 4"); Next and Back; optional "Save draft" at end (sets `isActive: false`) or leave always active. No single long page to reduce overwhelm and bounces.

**Form component:** One combined form that accepts `mode: "create" | "edit"`. Create: submit to `POST /api/v1/experiences` (auth = host). Edit: prefill from event (later), submit to `PUT /api/v1/experiences/:id`. Shared validation and step logic.

**Persistence (mobile-friendly):** Use Zustand for step + form state, with **persist** (localStorage). Each step saves to the store so refresh or leaving the page doesn’t lose data. On the **final step** we POST the full payload to the backend; no per-step API calls.

**POST / create:** Use **TanStack Query’s useMutation** for create (and later update). Why: loading/error state out of the box, and we can invalidate the experiences list query on success so the table updates. The actual HTTP call stays in **lib** (axios) for consistency with auth-client: e.g. `lib/experiences-client.ts` has `createEvent(payload)` that does `axios.post(..., payload)` with `Authorization: Bearer <token>`. Component calls `useMutation({ mutationFn: createEvent, onSuccess: () => { queryClient.invalidateQueries(...); router.push(...); } })`. **Fetch list:** useQuery for the experiences table (dashboard) as planned.

**Backend reference:** Routes: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `PUT /:id/toggle-status` (all under `/api/v1/admin/experiences`, requireAuth). Validation: createEventSchema (tickets[] required, customQuestions[] optional; no single pricing). Server fixes slug from title if slug empty; media is `{ url, type: 'image'|'video' }[]`.

**Implementation order (suggested):** 1) Route + shell (new page with step state). 2) Step 1 (Basics) + Zustand store with persist + client validation. 3) Step 4 (Pricing) so we can build full payload. 4) Step 2 (Media) + upload. 5) Step 3 (FAQs). 6) Wire create (useMutation + lib createEvent); then edit mode + prefill.

**Step 1 done:** Route `/host/experiences/new?type=event`, `EventFormShell` (stepper, Cancel, Step X of 4), `Step1Basics` (title, slug, location, description, spots, start/end date in **DD/MM/YYYY** format, dateDisplayText, isActive). Validation: start date cannot be in the past; end date must be after start date. Store/API still use YYYY-MM-DD; display/input use DD/MM/YYYY. Zustand `event-form-store` with persist (localStorage). `lib/experiences-client.ts` has `createEvent(payload, token)`. "Create event" button on experiences page.

**Step 2 done:** `Step2Media` (Media step). Single **drag-and-drop** area via `react-dropzone`: "Drag & drop files here, or click to select"; supports images (JPG, PNG, GIF, WebP) and videos (MP4, WebM, MOV). `lib/upload-client.ts`: only `uploadMedia`; **no `Content-Type` header** so axios sets `multipart/form-data` with boundary (fixes "No files uploaded"). Step shows current media list (thumbnail + type + remove); Back/Next. Toasts on success/error.

**Step 3 done:** `Step3Faqs` (FAQs step). List of FAQ rows (question + answer); Add FAQ, Remove per row. Validation on Next: if any row has empty question or answer, toast error; else nextStep(). Back/Next. Store: faqs, setFaqs.

**Step 4 done:** `Step4Pricing` (Pricing step). **Ticket-level system:** tickets array (label + price, code generated from label; at least one); optional customQuestions (label + required). Store: `tickets`, `customQuestions` (replaced deprecated single `pricing`). **Create flow wired:** payload built via `buildEventCreatePayload(basics, media, faqs, tickets, customQuestions)`; `createEvent(payload, token)`; on success reset, invalidate, redirect, toast. Edit prefill: `setTickets(event.tickets)`, `setCustomQuestions(event.customQuestions)`.

**Host form UX:** Back/Next buttons aligned `justify-end` (right) for right-thumb reach on mobile (Step 1–4).

---

## Experiences list table (step-by-step checklist)

**Scope:** `/host/experiences` – list current host’s events only (events only, no trips). Design reference: `trip-page/client` AdminTrips. Same behaviour: search (fuzzy), table (Title, Status toggle, Spots, Dates, Duration, Actions Edit), loading/empty states, toggle status → API + invalidate + toast.

**API (existing):** `GET /api/v1/admin/experiences` (list by host), `PUT /api/v1/admin/experiences/:id/toggle-status`. Base path: `getApiBaseUrl() + '/admin/experiences'`.

| Step  | Task                                                                                                                                                                                                                                                                                                                                        | Status |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| **1** | Extend `lib/experiences-client.ts`: add `listEvents(token)` (GET), add `toggleEventStatus(id, token)` (PUT). Ensure `createEvent` uses `${base}/admin/experiences` (already correct).                                                                                                                                                       | Done   |
| **2** | Add shadcn UI: `table`, `switch`, `tooltip`. Install `fuse.js` for client-side fuzzy search.                                                                                                                                                                                                                                                | Done   |
| **3** | Build `ExperiencesTable` component: columns Title, Status (Switch + badge), Spots, Dates, Duration, Actions (Edit). Use date-fns for dates; duration helper (X days or "-").                                                                                                                                                                | Done   |
| **4** | Convert `app/host/experiences/page.tsx` to client: `useQuery` listEvents, search state + Fuse (title, slug), loading/empty states, render ExperiencesTable; toggle status `useMutation` + invalidateQueries + toast.                                                                                                                        | Done   |
| **5** | Edit feature: `getEvent(id, token)` and `updateEvent(id, payload, token)` in experiences-client; `EventFormShell` accepts `mode: "create" \| "edit"` and `eventId`; Step4Pricing creates or updates by mode; edit page at `/host/experiences/[id]/edit` fetches event, prefills store, then renders shell with `mode="edit"` and `eventId`. | Done   |

**Future: trips + combined list (not implemented yet).** Keep two separate list functions: `listEvents(token)` and later `listTrips(token)` — two collections, different logic; no `listExperiences(type)`. Combined view: fetch both in parallel (`Promise.all([listEvents, listTrips])`), normalize with discriminator (e.g. `kind: 'event' | 'trip'`), sort by `updatedAt` desc, render one table. URL: `?type=event` (events only), `?type=trip` (trips only), `?type=event,trip` (combined). Current work: events-only flow only.

---

## Experiences list – mobile & view live

| #   | Task                                                                                                                                                                                         | Status |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | **Cards view for mobile** – On viewport \< md, show event list as cards (image, title, location, dates, Edit + View live). Table on md+.                                                     | Done   |
| 2   | **Open link button** – Button that opens the public event URL in a new tab (ExternalLink icon).                                                                                              | Done   |
| 3   | **Host username for view live** – No backend change: login response already returns `user.username`; saved in auth store. Frontend builds `/hosts/[username]/events/[eventSlug]` from store. | Done   |
| 4   | **View live button** – In table and cards: ExternalLink opens `/hosts/[username]/events/[eventSlug]` (new tab). Uses `useAuthStore` for username.                                            | Done   |

---

## Event Landing Page (public, customer-facing)

**Route:** `/hosts/[username]/events/[eventSlug]` — SSR where possible; single responsive layout (no separate desktop/mobile components).

**PRD – components (in order):**

1. **Hero** – Image + optional video; scrollable media (shadcn Carousel). Carousel is content-agnostic; use `<img>` or `<video>` per item.
2. **Event Information** – Event title; host name + display picture; host bio and Instagram link (in modal); Share button alongside host details.
3. **Event Details** – Location; date & time; event description (long-form).
4. **FAQs** – Simple Q&A list (single unified list; no categories).
5. **Pricing & Booking CTA** – Single ticket type → show price; multiple (future) → “Starting from ₹X”. CTA opens ticket selector in a bottom drawer (half-screen).
6. **Footer** – “Powered by Supersquad”; secondary “Host your event” (small text).

**Removed from old trip-page:** Category, itinerary, amenities, accommodation, spots-left as a separate block, etc. Keep only the above.

**Tech:** shadcn Carousel (Embla); one page composes small components (Hero, EventInfo, EventDetails, EventFaqs, PricingCta, Footer). Best practices: componentize where appropriate; avoid one long file.

**API:** `GET /api/v1/hosts/:username/events/:eventSlug` — returns event with populated host (name, username, image, bio, instagram). Response shape: `{ success, data }`, `data` = event doc with `hostId` populated.

| #   | Task                                                             | Status |
| --- | ---------------------------------------------------------------- | ------ |
| 1   | PRD in PROGRESS.md                                               | Done   |
| 2   | Add shadcn carousel; route + fetch public event                  | Done   |
| 3   | EventHero (carousel: image + video support)                      | Done   |
| 4   | EventInfo, EventDetails, EventFaqs, EventPricingCta, EventFooter | Done   |
| 5   | Single page layout, loading/error/not-found                      | Done   |

---

## Checkout page – discount codes (event landing)

**Route:** `/hosts/[username]/events/[eventSlug]/checkout`. Backend: `GET /api/v1/hosts/:username/events/:eventSlug/discount-codes` (list active codes, no auth), `POST /api/v1/admin/discount-codes/validate` (body `{ code, eventId }`, no auth).

**Implemented:**

- **lib/discount-codes-client.ts** – `listPublicDiscountCodesForEvent(username, eventSlug)`, `validateDiscountCode(code, eventId)`; types `PublicDiscountCodeItem`, `ValidateDiscountCodeResult`.
- **CheckoutContent** – State: `appliedDiscount` (code + type + amount + currency). `handleApplyCoupon`: calls validate API; on success sets discount, closes modal, toast; on failure toast with message. `handleRemoveCoupon` clears discount. Passes `appliedDiscount` to CheckoutExclusiveOffers and CheckoutPricingSummary; passes `eventId`, `username`, `eventSlug` to OffersModal.
- **OffersModal** – Fetches available coupons when open (`useQuery` list by username/eventSlug). Apply form: submit calls parent `onApplyCoupon(code)` (async); loading state (disabled input + spinner on button); clears input on success. Lists "Available Coupons" (code + formatDiscount) or "No coupons available for this event yet."
- **CheckoutExclusiveOffers** – When no discount: "Apply Coupons" button opens modal. When discount applied: shows code + discount text (e.g. "SAVE20", "₹50 off") and remove (X) button.
- **CheckoutPricingSummary** – Optional `appliedDiscount`. Discount line "Discount (CODE)" with negative amount; subtotal after discount; GST on subtotal after discount; toPay. Percentage: discount = entryFee \* amount / 100; flat: discount = min(amount, entryFee).

**Payment:** Pay & Reserve still stubbed; discount is applied to pricing display only.

---

## Toasts (react-hot-toast)

- **Unauthenticated on protected route:** "Please sign in to continue" (host layout, before redirect).
- **Login success:** "Signed in successfully" (HostLoginForm, after setAuth). Kept to one success toast to avoid spam.
- **Checkout coupons:** "Coupon applied" (success); "Invalid code" / server message (error); "Could not validate coupon" (network error). Attendee validation: "Please fix the errors in the attendee details below."
- Toaster in root layout (`top-center`, 4s duration).

---

## Conventions

- **Custom components:** Any new custom components go in `components/custom/`, not `components/ui/` (ui is reserved for shadcn). Only `required-mark` lives in custom; form fields are inlined in Step1Basics (no form-field-input / form-field-textarea).
- **Upload:** Client uses only `POST /api/v1/upload/media` (field `files`, array). Server single-image and single-video routes are commented out; only `/media` is active.

---

## Mobile "More" tab

- Bottom bar has **Experiences**, **More**, **Account**. **More** → `/host/more` with links to Leads, **Discount codes** (real link to `/host/discount-codes`), etc. Add more links as features ship.

---

## Discount Codes (host dashboard) – done

**Context:** Backend: `/api/v1/admin/discount-codes`. List, getOne, create, update, toggle-status, **delete** (204). **v1 MVP:** Client does **not** use `experienceId` or `experienceType` — no event-scoped UI; all codes apply to all events. **Flat (₹) only** — no percentage in UI; schema supports it but dormant. Code is **read-only on edit** (editable only on create).

**Implemented:**

- **lib/discount-codes-client.ts** – list, getOne, create, update, toggleDiscountCodeStatus, **deleteDiscountCode**; types (CreatePayload type: "flat" only; UpdatePayload no type/code); no experienceId in payloads.
- **Nav** – Desktop: "Discount codes" in HostShell (Percent icon). Mobile: More page link to `/host/discount-codes`.
- **Route** – `app/host/discount-codes/page.tsx`: useQuery list, Fuse search by code, loading/error/401, Create button; deleteMutation with confirm; table (md+) / cards (&lt; md).
- **DiscountCodesTable** – Code, Discount, Validity, Usage, Status (Switch + badge), Actions (Edit, Delete). Delete with confirmation; isDeletingId for loading state.
- **DiscountCodesCards** – Card per code; Edit + Delete (with confirm and isDeletingId).
- **DiscountCodeFormModal** – Form: code (read-only when editing), amount (₹), maxUsage, startsAt, expiresAt, isActive. No type selector (flat only). Fullscreen on &lt; md, centered dialog on md+. Create sends type: "flat"; update does not send type/code.
- **401** – Same as experiences: clearAuth, toast, redirect to login.

**Shared code:** `ApiResponse<T>` in `types/index.ts`; discount code display formatters (`formatDiscountCodeValidity`, `formatDiscountCodeDiscount`, `formatDiscountCodeUsage`) in `lib/utils.ts`; `DiscountCodeDisplayFields` in types (minimal fields for formatters).

**Validity display:** "Always" when no dates; "From d MMM yyyy" / "Until d MMM yyyy" when one set; "d MMM yyyy – d MMM yyyy" when both.

---

**Types (v1.7):** Event: `tickets: EventTicket[]`, `customQuestions?: EventQuestion[]`. **ApiResponse&lt;T&gt;** in types (shared by auth, experiences, discount-codes, upload clients). **DiscountCodeDisplayFields** for discount formatters (amount, usedCount, maxUsage, startsAt, expiresAt). Booking types for future checkout: `BookingAttendee`, `TicketBreakdownItem`, `ExperienceSnapshot`, `PaymentStatus`.

_Last updated: Checkout page – discount codes wired (list, validate, apply, remove, pricing summary)._
