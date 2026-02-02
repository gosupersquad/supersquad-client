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

**Next:** As needed (e.g. Experiences table, event create/edit).

---

## Toasts (react-hot-toast)

- **Unauthenticated on protected route:** "Please sign in to continue" (host layout, before redirect).
- **Login success:** "Signed in successfully" (HostLoginForm, after setAuth). Kept to one success toast to avoid spam.
- Toaster in root layout (`top-center`, 4s duration).

---

## Mobile "More" tab

- Bottom bar has **Experiences**, **More**, **Account**. **More** → `/host/more` page with links to Leads, Coupons (placeholder "coming soon"), etc. Keeps the bar to 3 tabs; extra items live under More. Add more links on the More page as features ship.

---

_Last updated: Task 5 skipped; Task 6 (theme toggle) done; component format noted._
