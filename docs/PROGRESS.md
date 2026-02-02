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

## Next: task breakdown

Ready to create tasks to get started. Suggested order:

1. **robots.txt** – Add `Disallow: /admin/master` (and any host disallow if desired).
2. **Host auth** – `/host/login`, protected layout for `/host/*`.
3. **Host layout** – `/host/dashboard` with sidebar (Experiences default), mobile-friendly.
4. **Experiences table** – `/host/experiences?type=event` (event-only for Phase 1), responsive.
5. **Event create/edit** – `/host/experiences/new?type=event`, `/host/experiences/[id]/edit?type=event`.
6. **Host edit** – Host profile/settings (route TBD, e.g. `/host/settings`).
7. **Event landing page** – `/hosts/[username]/events/[eventSlug]` (public, SSR, mobile-friendly).

Reference (design only): `trip-page/client` (admin branch) – AdminLayout, AdminTrips, AdminHosts, etc.

---

_Last updated: PRD v1.7; architecture and Phase 1 scope; robots.txt requirement; ready for tasks._
