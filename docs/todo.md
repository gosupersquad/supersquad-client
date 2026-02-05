Here’s a clear order to start on the **host** side.

---

## Where to start (host)

**Order:** Auth → Layout → Experiences list → Create/Edit → Rest.

1. **Host auth**
   - So you can actually use `/host/*`.
   - `/host/login` (page + form).
   - Backend: host login endpoint (if not already there).
   - Protected layout: any `/host/*` except `/host/login` requires auth; else redirect to `/host/login`.

2. **Host layout (dashboard shell)**
   - Once logged in, you need a shell.
   - `/host/dashboard` with sidebar: **Experiences** (default), later Bookings/Coupons.
   - Same layout wraps all `/host/*` except `/host/login`.
   - Mobile-friendly (sidebar → drawer or bottom nav on small screens).

3. **Experiences table**
   - First real screen: `/host/experiences?type=event`.
   - List events (read), responsive (table on desktop, cards/list on mobile).
   - Phase 1 = events only; filter by type when trips exist.

4. **Event create / edit**
   - `/host/experiences/new?type=event`, `/host/experiences/[id]/edit?type=event`.
   - Form + API for create/update.

5. **Host edit**
   - Host profile/settings (e.g. `/host/settings` or similar).
   - Can be right after experiences or in parallel.

6. **Event landing page**
   - `/hosts/[username]/events/[eventSlug]` (public).
   - Can be built in parallel once you have at least one event; doesn’t depend on being logged in.

**robots.txt**

- Can be done anytime (e.g. when you first deploy or when you add the app shell).
- Static `public/robots.txt` with `User-agent: *` and `Disallow: /admin/master` as in PRD/PROGRESS.

---

## Summary

- **Start with:** Host auth (login + protected `/host/*`), then host layout (dashboard + nav), then experiences table (list events).
- That gives you: _host logs in → lands on dashboard → sees list of events_.
- Then add event create/edit, host edit, and the public event landing page (and robots.txt when convenient).

If you want, next step is: turn this into a concrete task list (e.g. in PROGRESS or a ROADMAP) and pick the first task to implement (e.g. “Host login page + route” or “Protected layout for /host/\*”).
