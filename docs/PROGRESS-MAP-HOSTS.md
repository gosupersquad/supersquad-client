# MAP – Host Create, Read (list), Update

**Purpose:** Plan and track Master Admin Panel (MAP) **Hosts** tab: list all hosts, create host, update host. No delete. Approval flow and Pending tab are done; this doc is for Host CRUD only.

**Status:** In progress – backend done; frontend Hosts list + Create/Update modals implemented.

**Related:** Frontend context in [PROGRESS.md](./PROGRESS.md). Backend context in [server/docs/ROADMAP.md](../../server/docs/ROADMAP.md).

---

## 1. Goal (HLD)

- **Who:** Master admin only (existing MAP guard + `requireMaster`).
- **What:** Manage hosts from MAP: **list** all hosts, **create** a new host, **read** one host (for edit), **update** a host. **No delete** in scope.
- **Where:** Under `/admin/master` – existing layout with tabs: Pending (Approvals), Experiences (placeholder), **Hosts** (this work). Hosts tab becomes the main content for host CRUD.

---

## 2. Scope

| In scope                                          | Out of scope                                         |
| ------------------------------------------------- | ---------------------------------------------------- |
| List hosts (cards)                                | Delete host                                          |
| Create host (form (in modal))                     | Host self-service signup (separate)                  |
| Update host (form (modal), same fields as create) | MAP “All experiences” list (client to confirm later) |
| Master-only APIs + UI                             | Changing host password from MAP (can be later)       |

---

## 3. Backend (LLD)

### 3.1 Existing

- **Host model** (server): `name`, `username`, `email`, `password`, `image?`, `bio?`, `isActive`, `instagram?`, timestamps. Username and email unique.
- **Auth:** Login uses Host (or MasterAdmin). No existing “list all hosts” or “create/update host by master” under `/api/v1/admin/master`.
- **Middleware:** `/api/v1/admin/master` already has `requireAuth` + `requireMaster`.

### 3.2 New MAP host APIs (under `/api/v1/admin/master`)

All require Bearer token + role = master.

| Method | Route        | Description                                                                                                                                                                                    |
| ------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/hosts`     | List all hosts (slim or full per need). Query: optional `search`, `isActive` for filter later.                                                                                                 |
| GET    | `/hosts/:id` | Get one host by id (for view/edit). Return safe fields only (no password hash).                                                                                                                |
| POST   | `/hosts`     | Create host. Body: name, username, email, password (plain, hash in service), image?, bio?, isActive?, instagram?. Validate uniqueness of username/email.                                       |
| PUT    | `/hosts/:id` | Update host. Body: same as create except password optional (if present, re-hash). Do not allow changing username/email to a value that conflicts with another host (or allow with validation). |

- **List response:** Array of `{ _id, name, username, email?, image?, bio?, isActive, createdAt }` (no password).
- **Get one / Create / Update response:** Same host shape (no password).
- **Errors:** 400 validation, 409 conflict (username/email taken), 404 not found.

### 3.3 Schema / validation

- Reuse or extend existing Host schema. Create/update payload: Zod (or existing) validation; password required on create, optional on update; username/email format and uniqueness.
- Passwords: bcrypt hash on create and when password is provided on update.

---

## 4. Frontend (LLD)

### 4.1 Routes

| Route                 | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `/admin/master/hosts` | List hosts; Create and Update are **modals** (no separate routes). |

- All under existing MAP layout. Title for MAP set to **Master Admin - Supersquad** (done).

### 4.2 Pages & modals

1. **List (`/admin/master/hosts`)**
   - Title: “Hosts”, short description (e.g. “Manage hosts”).
   - “Add host” button → opens **Create host modal**.
   - Content: **cards**. Each card: avatar/placeholder, name, username, image (if any), bio, isActive badge, instagram, **Edit** button (opens **Update host modal**).
   - Optional: search by name/username (client-side only for now).
   - Loading and empty states.

2. **Create host (modal)**
   - Form: name, username, email, password, **image** (upload via `upload-client.ts`, use returned url), bio, instagram (url?). **isActive = true** by default.
   - Submit → POST `/hosts` → success: toast, close modal, invalidate list.
   - Cancel → close modal.

3. **Update host (modal)**
   - Load host with GET `/hosts/:id` when modal opens.
   - Same fields as create; **password optional** (leave blank = no change).
   - Submit → PUT `/hosts/:id` → success: toast, close modal, invalidate list.
   - Cancel → close modal.

### 4.3 Client API

- **Single MAP client:** `lib/master-admin/hosts-client.ts` (all MAP axios calls). Add: `listHosts(token)`, `getHost(id, token)`, `createHost(payload, token)`, `updateHost(id, payload, token)`. Use a **shared axios base instance** with `Authorization: Bearer` (and baseURL) to avoid repeating headers.
- Types: `HostListItem`, `HostDetail` (or one shape), create/update payload types.

---

## 5. Wireframe / UX (concise)

- **List:**
  - Header: “Hosts” + short description + “Add host” button.
  - Cards: avatar/placeholder, name, username, bio, active badge, instagram, “Edit” button.
  - Mobile-friendly; consistent with MAP Pending (padding, spacing).

- **Create / Edit:**
  - Single column form. Required: name, username, email (create: password). Optional: image, bio, instagram.
  - Edit: password field optional with hint “Leave blank to keep current.”
  - Buttons: Submit, Cancel (back to list).

- **Navigation:**
  - we will use modals so no navigation

---

## 6. Task list (implementation order)

### Backend (server)

| #   | Task                                                                                                                                                                                                       | Status |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| B1  | Add `GET /api/v1/admin/master/hosts` – list all hosts (slim: id, name, username, image?, bio?, isActive, createdAt).                                                                                       | [x]    |
| B2  | Add `GET /api/v1/admin/master/hosts/:id` – get one host (no password). 404 if not found.                                                                                                                   | [x]    |
| B3  | Add `POST /api/v1/admin/master/hosts` – create host. Body validation (name, username, email, password required; image, bio, isActive, instagram optional). Hash password; check username/email uniqueness. | [x]    |
| B4  | Add `PUT /api/v1/admin/master/hosts/:id` – update host. Body: same fields, password optional. Validate uniqueness on username/email if changed.                                                            | [x]    |
| B5  | Add validation schemas (Zod) and error handling (400, 409, 404).                                                                                                                                           | [x]    |

### Frontend (client)

| #   | Task                                                                                                                                                                                                                    | Status |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F1  | In `lib/master-admin/client.ts`: add listHosts, getHost, createHost, updateHost + types; refactor to use **axios base instance** (token in headers) for all MAP calls.                                                  | [x]    |
| F2  | **Hosts list page** `app/admin/master/hosts/page.tsx`: useQuery list, “Add host” button (opens Create modal), **cards** with name, username, image, bio, isActive, instagram, Edit (opens Update modal). Loading/empty. | [x]    |
| F3  | **Create host modal**: form (name, username, email, password, image upload via upload-client folder=hosts, bio, instagram url; isActive = true). Submit → createHost → toast, close, invalidate list.                   | [x]    |
| F4  | **Update host modal**: load host by id (getHost), same form with password optional. Submit → updateHost → toast, close, invalidate list.                                                                                | [x]    |
| F5  | Ensure Hosts tab in MAP layout links to `/admin/master/hosts` and is active when on that path.                                                                                                                          | [x]    |
| F6  | Optional: client-side search/filter on list by name/username.                                                                                                                                                           | [ ]    |

---

## 7. Out of scope (for later)

- Delete host.
- MAP “All experiences” list (client to confirm).
- Host self-signup.
- Password change from MAP (can be added later to update).

---

**Implementation:** Backend B1–B5 and frontend F1–F5 are done. Host API lives in `lib/master-admin/hosts-client.ts`. Upload client accepts `folder: "events" | "hosts"` for host images.
