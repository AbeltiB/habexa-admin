# habexa-admin — CLAUDE.md

## What this repo is

The internal operations dashboard for Habexa. Used by the founding team only. It is how you manage content, update stock prices, confirm manual subscription payments, view users, and send push notifications.

**URL:** `https://admin.habexa.com`
**Platform:** Vercel
**Access:** Password-protected via `ADMIN_SECRET` environment variable — no user registration

This is not a public-facing product. Prioritize function over polish. Fast to build, fast to use.

---

## Stack

Same as `habexa-web` minus PWA:

| Dependency | Version | Purpose |
|-----------|---------|---------|
| next | 15.x | Framework (App Router) |
| react | 19.x | UI |
| @habexa/sdk | latest | Shared types |
| tailwindcss | ^3.x | Styling |
| shadcn/ui | latest | Components (tables, forms, dialogs) |
| lucide-react | latest | Icons |
| swr | ^2.x | Data fetching |
| react-hook-form | ^7.x | Forms |

---

## Repo Structure

```
habexa-admin/
├── app/
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx              Password entry
│   └── (admin)/
│       ├── layout.tsx            Admin shell: sidebar nav + auth guard
│       ├── page.tsx              Dashboard overview
│       ├── modules/
│       │   ├── page.tsx          Module list
│       │   ├── new/page.tsx      Create module
│       │   └── [id]/page.tsx     Edit module + manage quiz questions
│       ├── prices/
│       │   └── page.tsx          Bulk price update (manual + CSV)
│       ├── subscriptions/
│       │   └── page.tsx          Pending confirmations + active list
│       ├── users/
│       │   ├── page.tsx          User list with search + filter
│       │   └── [id]/page.tsx     User detail + actions
│       └── push/
│           └── page.tsx          Send broadcast push notification
├── components/
│   ├── ui/                       shadcn/ui (do not modify)
│   ├── modules/
│   │   ├── ModuleForm.tsx        Create/edit module form (all fields)
│   │   └── QuizEditor.tsx        Add/edit/reorder quiz questions
│   ├── prices/
│   │   ├── PriceTable.tsx        Editable price grid
│   │   └── CSVUpload.tsx         CSV drag-drop + preview
│   ├── subscriptions/
│   │   ├── PendingCard.tsx       Single pending subscription + confirm/reject buttons
│   │   └── SubscriptionTable.tsx Active/expired list
│   ├── users/
│   │   ├── UserTable.tsx         Searchable, filterable user list
│   │   └── UserDetail.tsx        Full user profile + action buttons
│   └── shared/
│       ├── Sidebar.tsx           Left nav (desktop)
│       ├── StatCard.tsx          Dashboard metric card
│       └── ConfirmDialog.tsx     Reusable destructive action confirmation
├── lib/
│   ├── api.ts                    Admin API client (calls /admin/* routes)
│   └── auth.ts                   Admin session (cookie-based)
├── middleware.ts                  Redirect to /login if no admin cookie
├── .env.example
└── tsconfig.json
```

---

## Auth

Admin auth is completely separate from user auth. There is no JWT. There is no OTP.

```typescript
// Login flow:
// 1. Admin enters password on /login page
// 2. POST to habexa-api /admin/auth/login with { secret: string }
// 3. API compares to ADMIN_SECRET env var (constant-time comparison)
// 4. On match: set httpOnly cookie 'habexa_admin' with the secret value
// 5. Cookie is checked by middleware.ts on every request

// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get('habexa_admin')?.value
  const isLoginPage = req.nextUrl.pathname === '/login'

  if (!cookie || cookie !== process.env.ADMIN_SECRET) {
    if (isLoginPage) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLoginPage) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next|favicon).*)'] }
```

**Security notes:**
- `ADMIN_SECRET` must be at least 32 random characters
- Cookie is `httpOnly: true, secure: true, sameSite: strict`
- The admin app is deployed to a separate domain (`admin.habexa.com`) — CORS prevents cross-origin access
- Do not add role-based access control — this is a single-admin system for now

---

## Pages — Detailed Spec

### Dashboard (`/`)

Four stat cards in a 2×2 grid:

```
Total Users     |  Active Today
1,247           |  389
+23 today       |  D7: 31%

Premium Users   |  Revenue MTD
94              |  ETB 7,426
7.5% conversion |  94 × ETB 79
```

Below stats: **Pending Confirmations alert banner** — shown if any subscriptions have `status = 'pending'`. Clicking goes to `/subscriptions`. This is the most time-sensitive task for the admin.

Below that: last 10 user registrations (phone, displayName, joined time).

---

### Module Management (`/modules`)

**List view:**

Table with columns: Track, Order, Title (EN), Type, Premium, Status, Actions.

Status options: Draft | Live | Hidden.

Actions: Edit | Publish/Unpublish | Delete (with confirm dialog).

Filter by track: All | Foundation | Intermediate | Advanced.

---

**Module editor (`/modules/new` and `/modules/[id]`):**

Split into two panels:

**Left panel — Module metadata:**
```
Track:          [ Foundation ▼ ]
Order:          [ 1 ]
Type:           [ Video ▼ ]          (Video | Article | Interactive)
Is Premium:     [ No ▼ ]
Duration (min): [ 8 ]
Status:         [ Draft ▼ ]

Title (EN):     [ __________________________ ]
Title (AM):     [ __________________________ ]

Description (EN): [ _______________________ ]
Description (AM): [ _______________________ ]

Thumbnail:      [ Upload ] or [ URL __________ ]
```

**If type = Video:**
```
Video URL (Cloudflare Stream):
[ https://videodelivery.net/abc123/manifest/video.m3u8 ]
[ Upload to Cloudflare ]  (opens Cloudflare Stream in new tab)
```

**If type = Article:**
```
Content (EN):  [ Markdown editor — full width ]
Content (AM):  [ Markdown editor — full width ]
```

**Right panel — Quiz Questions:**

Each question card:
```
Question (EN): [ _________________________________ ]
Question (AM): [ _________________________________ ]

Option 0 EN: [________]  Option 0 AM: [________]
Option 1 EN: [________]  Option 1 AM: [________]
Option 2 EN: [________]  Option 2 AM: [________]
Option 3 EN: [________]  Option 3 AM: [________]

Correct answer: [ Option 0 ▼ ]

Explanation (EN): [ shown to user after wrong answer ]
Explanation (AM): [ ________________________________ ]

[ ↑ Move Up ]  [ ↓ Move Down ]  [ 🗑 Delete ]
```

[ + Add Question ] button at bottom.

**Validation before publish:**
- Must have both EN and AM title
- If video type: must have videoUrl
- If article type: must have both EN and AM content
- Must have at least 1 quiz question
- Every quiz question must have all 4 options in both languages

---

### Price Management (`/prices`)

**Header:**
```
Stock Prices
Last updated: Today 9:47am EAT    [ Upload CSV ]
```

**Editable table:**

| Symbol | Company (EN) | Company (AM) | Current Price (ETB) | Prev Close (ETB) | Volume |
|--------|-------------|-------------|-------------------|-----------------|--------|
| ETSL | Ethio Telecom | ኢትዮ ቴሌኮም | [850.00] | 832.00 | [12500] |
| AWBI | Awash Bank | አዋሽ ባንክ | [124.50] | 124.50 | [4300] |

Fields in brackets are editable in-place. Previous close auto-populates from the last save's current price.

Trading date selector (defaults to today).

[ Save All Prices ] button — bulk updates all rows in one API call.

**CSV Upload:**

Expected format (shown to admin):
```csv
symbol,current_price,previous_close,volume
ETSL,850.00,832.00,12500
AWBI,124.50,124.50,4300
```

Upload → preview table → confirm → save.

---

### Subscriptions (`/subscriptions`)

**Pending section (top, highlighted):**

```
⚡ 3 subscriptions awaiting confirmation
```

Each pending card:
```
+251911234567  (Yonas Tadesse)
Plan: Monthly — ETB 79
Method: Bank Transfer (CBE)
Reference: TXN-20260614-001
Submitted: 2 hours ago

[ ✅ Confirm & Activate ]    [ ❌ Reject ]
```

On confirm:
- PUT `/admin/subscriptions/:id/confirm`
- Updates subscription status → active
- Updates user.isPremium → true
- Push notification sent to user
- Card disappears from pending list

On reject:
- Confirm dialog: "Are you sure? The user will be notified."
- PUT `/admin/subscriptions/:id/reject`
- Card disappears

**Active subscriptions table below:** filterable by status, sortable by expiry date.

---

### Users (`/users`)

**List view:**

Search by phone number or display name.
Filter: All | Premium | Free | Inactive (no login in 14+ days).

Table: Phone, Name, Premium, Joined, Last Seen, Actions (View).

---

**User detail (`/users/[id]`):**

```
+251911234567  ·  Yonas Tadesse
Joined: Jan 14 2026  ·  Last seen: 2 hours ago
Language: Amharic  ·  Level: Intermediate

── LEARNING ────────────────────────────────────────
Modules completed:  7 of 15
Avg quiz score:     82%
Current streak:     14 days

── PAPER TRADING ───────────────────────────────────
Portfolio value:    ETB 54,320  (+8.64%)
Total trades:       23
Current rank:       #12 (this week)

── SUBSCRIPTION ────────────────────────────────────
Status:   Active
Plan:     Monthly
Expires:  Jul 14 2026
Method:   Bank Transfer
Reference: TXN-20260614-001

── ACTIONS ─────────────────────────────────────────
[ Reset Paper Account ]        (confirm dialog)
[ Cancel Subscription ]        (confirm dialog)
[ Send Push Notification ]     (opens mini-form)
[ Export User Data ]           (JSON download)
```

---

### Push Notifications (`/push`)

```
Send Push Notification

Audience:
● All users (1,247)
○ Premium only (94)
○ Free only (1,153)
○ Inactive 7+ days (342)

Title (EN): [___________________________]
Title (AM): [___________________________]

Body (EN):  [___________________________]
Body (AM):  [___________________________]

Link:       [/learn/what-is-a-share    ]  (optional)

[ Preview ]    [ Send Now ]

── SENT HISTORY ────────────────────────────────────
Jun 14  "ESX opens in 30 min"  →  847 sent
Jun 10  "New module: P/E Ratios"  →  1,201 sent
```

On "Send Now": confirm dialog showing recipient count, then POST to `/admin/push/broadcast`.

The API enqueues individual push jobs for each user in the selected segment — doesn't block.

---

## Admin API Client

```typescript
// lib/api.ts
// All calls go to habexa-api /admin/* routes
// Sends cookie automatically (credentials: 'include')

adminApi.dashboard.stats(): Promise<DashboardStats>

adminApi.modules.list(): Promise<Module[]>
adminApi.modules.create(data): Promise<Module>
adminApi.modules.update(id, data): Promise<Module>
adminApi.modules.delete(id): Promise<void>
adminApi.modules.publish(id): Promise<Module>
adminApi.modules.unpublish(id): Promise<Module>

adminApi.prices.list(): Promise<StockPrice[]>
adminApi.prices.bulkUpdate(prices): Promise<void>
adminApi.prices.uploadCSV(file): Promise<{ preview: StockPriceUpdate[] }>
adminApi.prices.confirmCSV(prices): Promise<void>

adminApi.subscriptions.list(status?): Promise<Subscription[]>
adminApi.subscriptions.confirm(id): Promise<void>
adminApi.subscriptions.reject(id): Promise<void>

adminApi.users.list(params): Promise<PaginatedResponse<User>>
adminApi.users.get(id): Promise<UserDetail>
adminApi.users.resetPaperAccount(id): Promise<void>
adminApi.users.cancelSubscription(id): Promise<void>
adminApi.users.sendPush(id, payload): Promise<void>

adminApi.push.broadcast(payload): Promise<{ queued: number }>
adminApi.push.history(): Promise<PushBroadcast[]>
```

---

## Environment Variables

```bash
# The API to call
NEXT_PUBLIC_API_URL=https://api.habexa.com

# Admin auth (same value as ADMIN_SECRET in habexa-api)
ADMIN_SECRET=your-admin-secret-here
```

The `ADMIN_SECRET` is used in `middleware.ts` to verify the cookie value without a round-trip to the API. It must match the value in `habexa-api`.

---

## Commands

```bash
npm run dev           # Next.js dev (port 3001 — different from habexa-web)
npm run build
npm run start
npm run typecheck
```
