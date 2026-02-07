---
---

**Version:** 1.7 (FINAL – LOCKED)

**Date:** February 2026

**Status:** APPROVED FOR IMPLEMENTATION

**Stage:** 0 → 1

_(v1.7: Event multi-ticket + customQuestions, Booking snapshot/attendees, DiscountCode schema aligned with server.)_

---

## 1. Objective

Rebuild the Supersquad MVP with a clean, minimal, and correct architecture aligned strictly with the PRD.

Primary goals:

- Full technical ownership
- Clear domain boundaries
- Immutable financial records
- Low operational cost
- Fast execution
- No premature scale assumptions

This document is the **final source of truth** for architecture, routes, schemas, and scope.

---

## 2. Roles (FINAL)

### Master Admin

- Internal platform role
- Uses Master Admin Panel (MAP)
- Can view/manage all hosts, experiences, and bookings

### Host

- External users
- Can create and manage **their own Events and Trips**
- Cannot access MAP

### Customer

- End users
- Can view public pages and complete bookings
- No dashboard in MVP

---

## 3. Domain Model (LOCKED)

There are **two distinct domain entities**:

- **Event** — minimal, time-bound experience
- **Trip** — complex, multi-day experience

### Design Rules

- ❌ Do not unify schemas
- ❌ Do not use polymorphic mega-models
- ✅ Separate schemas and services
- ✅ Unified admin surface and routing
- ✅ Bookings are immutable transaction records

---

## 4. Public Routes (FINAL)

**Current implementation (single Next.js app):**

- Event landing (public): `/hosts/[username]/events/[eventSlug]` — Host is identified by `username` (from Host model). Event landing page is SSR (route exists on server; page not yet built in client).
- Trip landing, checkout: not implemented (Phase 1 is event-only).

**Planned (unchanged):**

```
/[hostUsername]/
├── /events/[eventSlug]/         # Event landing (SSR) — implemented as /hosts/[username]/events/[eventSlug]
│   └── /checkout                # Event checkout (later)
└── /trips/[tripSlug]/           # Trip landing + checkout (later)
```

---

## 5. Admin / Host Routes (UNIFIED SURFACE)

**Current implementation:** Single app domain (no separate admin subdomain). Host-facing routes live under `/host/`:

```
app.gosupersquad.com/
├── /host/login
├── /host/dashboard
├── /host/experiences              # List (table on md+, cards on <md); ?type=event|trip for future filter
│   ├── /new                       # Create event (?type=event)
│   └── /[id]/edit                 # Edit event (?type=event)
├── /host/account
├── /host/more
└── /host/leads                    # placeholder
```

**Planned (not yet built):**

- `/admin/master/` — Master Admin Panel (hosts, experiences, bookings)
- `/host/bookings`, `/host/coupons`
- Trips: same pattern under experiences with type=trip

---

## 6. Architecture (LOCKED)

### High-Level

**Current implementation:** One Next.js app; one API server. No separate admin subdomain.

```scss
Nginx (80/443)
 ├─ app.gosupersquad.com    → Next.js (:3000)   # Host UI, public pages, future Master Admin
 └─ api.gosupersquad.com    → Express (:3001)    # REST API at /api/v1
```

_(admin.gosupersquad.com and gosupersquad.com as separate frontends are not used in current setup.)_

### Stack

**Frontend**

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form + Zod

**Backend**

- Express.js (TypeScript)
- MongoDB Atlas
- Mongoose
- JWT-based authentication

**Infrastructure**

- Azure VM
- Nginx
- PM2
- Cloudflare
- Cashfree (payments)

---

## 7. Authentication & Authorization

### Model

- Single `Host` collection
- Separate `MasterAdmin` collection for role elevation
- Role resolved at login

### JWT Payload (as implemented)

```tsx
{
  userId: string,
  role: 'host' | 'master'
}
```

Login response (POST `/api/v1/auth/login`) also returns `user: { id, name, username, email }`; frontend stores this in auth state (e.g. Zustand + localStorage) and uses `username` to build public URLs (e.g. `/hosts/[username]/events/[eventSlug]`). Host identity in URLs uses Host `username`, not a separate slug.

### Rules

- Host → experiences, bookings
- Master Admin → all routes
- Authorization via middleware
- No CSRF (token-based auth)
- Token rotation may be added later (same-domain support)

---

## 8. Database Schemas (FINAL – MVP SAFE)

### Host (as implemented)

```tsx
Host {
  _id,
  name,
  username,      // required, unique — used in public URLs (/hosts/:username/...)
  email,         // required, unique
  password,      // bcrypt hash
  image?,
  bio?,
  isActive,
  instagram?,
  createdAt,
  updatedAt
}
```

---

### Event (as implemented)

```tsx
Event {
  _id,
  hostId,
  title,
  slug,
  location,
  description,
  spotsAvailable,
  startDate,
  endDate,
  dateDisplayText?,
  media: { url, type: 'image' | 'video' }[],
  faqs: { question, answer }[],
  tickets: {
    code,      // system-generated at creation, not user-facing; used for linking in bookings
    label,     // user-facing; host edits this (e.g. "Standard", "Premium")
    price,
    currency: 'INR'
  }[],
  customQuestions: { label, required }[],   // host-defined extras; fixed fields (name, email, phone, instagram) are on BookingAttendee only
  isActive,
  createdAt,
  updatedAt
}
```

**Index:** unique `(hostId, slug)`

**Notes:** At least one ticket required. No per-ticket capacity in v1 (event-level `spotsAvailable` only).

---

### Trip

```tsx
Trip {
  _id,
  hostId,
  title,
  slug,
  description,
  images,
  startDate,
  endDate,
  itinerary?,
  price,
  currency,
  isActive,
  createdAt
}
```

**Index:** unique `(hostId, slug)`

ex:

```tsx
EventSchema.index({ hostId: 1, slug: 1 }, { unique: true });
```

---

### Booking (IMMUTABLE)

```tsx
Booking {
  _id,
  hostId,
  experienceType: 'event' | 'trip',
  experienceId,

  experienceSnapshot: {
    title,
    slug,
    description,
    startDate,
    endDate,
    location?,
    itinerary?,
    media: { url, type: 'image' | 'video' }[],
    tickets: { code, label, price, currency }[],
    customQuestions: { label, required }[]
  },

  ticketBreakdown: { code, quantity, unitPrice }[],
  attendees: {
    ticketCode,
    name,
    email,
    phone,
    instagram?,
    customAnswers: Record<string, string>   // [question label]: answer
  }[],

  totalQuantity,
  totalAmount,
  discountAmount?,

  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  paymentProvider?,
  orderId?,
  transactionId?,
  discountCodeId?,

  createdAt,
  updatedAt
}
```

Rules:

- Snapshot is server-generated at booking time (no reference to live Event)
- Fixed attendee fields (name, email, phone, instagram) live on each attendee; customAnswers keyed by question label
- One attendee per ticket; ticketBreakdown matches selection; totalAmount server-calculated
- Booking data is immutable; no recomputation after payment

---

### DiscountCode (as implemented – v1)

```tsx
DiscountCode {
  _id,
  code,
  type: 'percentage' | 'flat',
  amount,
  currency: 'INR',
  experienceType?,
  experienceId?,
  hostId,
  count?,        // max uses; unlimited if omitted
  usedCount?,   // default 0
  startsAt?,
  expiresAt?,
  isActive,
  createdAt,
  updatedAt
}
```

**Index:** unique `(hostId, code)`

---

### MasterAdmin

```tsx
MasterAdmin {
  _id,
  userId,
  createdAt
}
```

---

## 9. API Routes (FINAL)

**Base path:** `/api/v1` (client uses `NEXT_PUBLIC_API_URL` default `http://localhost:3001/api/v1`).

### Public (as implemented)

```ruby
GET  /api/v1/hosts/:username/events/:eventSlug   # Event by host username + event slug (no auth)
```

---

### Auth

```ruby
POST /api/v1/auth/login   # Body: { email, password }. Returns { data: { token, user: { id, name, username, email } } }
```

---

### Host (protected; Bearer token)

```ruby
GET    /api/v1/admin/experiences              # List current host's events
GET    /api/v1/admin/experiences/:id          # One event
POST   /api/v1/admin/experiences              # Create event (body: tickets[], customQuestions[], no pricing)
PUT    /api/v1/admin/experiences/:id          # Update event
PUT    /api/v1/admin/experiences/:id/toggle-status   # Toggle isActive
```

---

### Upload (protected)

```ruby
POST /api/v1/upload/media   # multipart/form-data, field "files" (array). Returns URLs.
```

---

### Not yet implemented (post-MVP or later)

```ruby
POST /api/bookings
POST /api/payments/create-order
POST /api/payments/verify
POST /api/discounts/validate
GET  /api/admin/master/hosts
GET  /api/admin/master/experiences
...
```

---

## 10. Checkout Flow (FINAL)

Entry:

```ruby
/hosts/[username]/events/[eventSlug]          # Landing: hero, details, pricing bar, "Reserve a spot"
/hosts/[username]/events/[eventSlug]/checkout # Checkout page
```

Flow:

1. **Landing:** Event details, pricing bar (single ticket → min price + "From X onwards" if multiple). CTA: "Reserve a spot".
2. **Ticket selection:** If one ticket type → go straight to checkout. If multiple → bottom drawer: choose quantity per ticket type, then "Reserve a spot".
3. **Checkout page:** Event summary (hero, title, host, location), coupon apply/list, **number of attendees** = total tickets selected. For each attendee: ticket type label + fixed fields (name, email, phone, instagram) + host customQuestions (answers stored as [label]: answer in customAnswers).
4. **Pay & Reserve:** Frontend sends eventId + ticket breakdown + attendees (+ optional coupon). Backend validates, builds snapshot, computes total (and discount), creates Booking (pending), creates Cashfree order, returns redirect. No price from frontend.
5. **Cashfree redirect** → payment → webhook: verify signature, find booking by orderId, set paymentStatus = paid, store transactionId.

---

## 11. Timeline (REALISTIC & LOCKED) // outdated, new timeline to be updated

**Day 1**

- Repo setup
- MongoDB Atlas
- Cloudflare R2
- Env config

**Day 2**

- Auth
- Schemas
- Core APIs

**Day 3**

- Admin UI
- Experiences CRUD
- ❌ Bookings view (post-MVP)

**Day 4**

- Public pages (SSR)
- Checkout
- Cashfree integration (may spill into Day 5)

**Day 5**

- Wiring
- Bug fixes
- ❌ Master Admin UI (post-MVP)

**Day 6–7**

- Deploy
- DNS + SSL
- Final testing

---

## 12. Explicit Non-Goals (MVP)

- Event/Trip deletion (only deactivate)
- Customer dashboard
- Analytics dashboards
- SEO customization
- Per-ticket capacity (event-level spotsAvailable only in v1)
- CI/CD
- Scaling concerns

---

## 13. Freeze Statement

This document defines:

- domains
- schemas
- routes
- architecture
- scope

**No renames, no refactors, no new abstractions after this point**
