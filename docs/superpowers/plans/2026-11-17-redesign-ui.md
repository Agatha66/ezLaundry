# ezLaundry UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ezLaundry feel finished on mobile and desktop: a responsive shell, smooth motion, dark mode, and the half-built features (ratings, addresses, loyalty, payment, notifications, admin charts) completed.

**Architecture:** Shared foundation first (colour tokens, theme, persistent app shell with page transitions, toast/confirm, motion primitives), then each page refreshed onto it. Pure logic (loyalty, notifications, reports, CSV) lives in `src/lib/*` with Vitest unit tests. UI is verified by `npm run build` + `npm run lint` + manual browser checks at 390px and 1280px.

**Tech Stack:** React 19, Vite 7, Tailwind 3 + shadcn, Framer Motion 12, next-themes, sonner, vaul, recharts, Firebase 12. Adds `vitest` (dev).

**Spec:** `docs/superpowers/specs/2026-11-17-redesign-ui-design.md`

## Global Constraints

- Brand colours: primary `#1188E9`, navy `#092635`, teal `#1A7A7E`; fonts Inter (body) + Poppins (headings).
- No one-tap demo login.
- Landing page (`src/sections/*`), `/login` and `/register` always render light.
- All new data fields are optional; orders/users without them must render.
- Firestore writes only to `users/{uid}` and `orders/{id}` (existing collections).
- Motion: durations ≤ 0.5s, wrap the app in `<MotionConfig reducedMotion="user">`.
- Desktop breakpoint for the sidebar is Tailwind `lg` (1024px).

## Review Focus

- Old orders with no `rating` / `paymentReceivedAt` / `statusHistory` timestamps as strings vs Firestore Timestamps → must render without crashing (`toDate` helper handles both). Tested in Task 2 (`notifications.test.ts`).
- Users with only legacy `address` and no `addresses` → Profile and New Order show that address as the default "Home". Tested in Task 2 (`addresses.test.ts`).
- Orders with `totalAmount` missing or a string → loyalty and reports treat it as a number/0. Tested in Task 2.
- Refreshing on a deep link (`/order/:id`) in dark mode → no light flash, shell renders. Manual check in Task 9.
- Mobile keyboard open in the New Order sheet → inputs stay visible (Drawer content scrolls). Manual check in Task 5.

---

### Task 1: Theme tokens, dark mode, codemod

**Files:**
- Modify: `src/index.css` (add `.dark` token block; set light `--background` to `#F5F7F9`-equivalent HSL `210 25% 97%`, `--card` white; add `--navy: 200 71% 12%`, `--teal: 181 65% 30%`)
- Modify: `tailwind.config.js` (add `navy`, `teal` colours)
- Create: `scripts/tokenize-colors.mjs` (one-off codemod, deleted after running)
- Create: `src/components/ThemeProvider.tsx`
- Modify: `src/App.tsx`, `src/services/orderService.ts` (`statusLabels` colours gain `dark:` variants)

**Interfaces:**
- Produces: `ThemeProvider({children})` (next-themes, `attribute="class"`, `defaultTheme="light"`, forces light when the pathname is `/`, `/login` or `/register`); `useTheme()` re-exported from next-themes.

- [ ] **Step 1:** Write the codemod with this exact mapping, applied to `src/pages/**` and `src/components/*.tsx` (not `ui/`, not `sections/`): `text-[#092635]`→`text-foreground`, `text-[#4A6375]`→`text-muted-foreground`, `bg-[#1188E9]`→`bg-primary`, `text-[#1188E9]`→`text-primary`, `border-[#1188E9]`→`border-primary`, `focus:border-[#1188E9]`→`focus:border-primary`, `focus:ring-[#1188E9]`→`focus:ring-primary`, `hover:text-[#1188E9]`→`hover:text-primary`, `hover:bg-[#1188E9]`→`hover:bg-primary`, `hover:border-[#1188E9]`→`hover:border-primary`, `border-[#D8E5EF]`→`border-border`, `bg-[#D8E5EF]`→`bg-border`, `text-[#D8E5EF]`→`text-border`, `bg-[#F5F7F9]`→`bg-background`, `border-[#F5F7F9]`→`border-background`, `bg-[#E6F4FF]`→`bg-primary/10`, `hover:bg-[#E6F4FF]`→`hover:bg-primary/10`, `bg-[#092635]`→`bg-navy`, `hover:bg-[#092635]`→`hover:bg-navy`, `bg-[#1A7A7E]`→`bg-teal`, `bg-white`→`bg-card` (word-boundary match only).
- [ ] **Step 2:** Run it: `node scripts/tokenize-colors.mjs`. Expected: prints per-file replacement counts; `grep -rc "text-\[#092635\]" src/pages` → 0.
- [ ] **Step 3:** Add the `.dark` tokens, ThemeProvider and status `dark:` variants; wrap `App` in `ThemeProvider` + `MotionConfig reducedMotion="user"`.
- [ ] **Step 4:** Verify: `npm run build` passes. In the browser, toggle `document.documentElement.classList.add('dark')` on `/dashboard`: text is readable, there are no white cards on a dark background, and `/` stays light.
- [ ] **Step 5:** Delete the codemod and commit: `feat: colour tokens and dark mode`.

### Task 2: Pure logic libs + Vitest

**Files:**
- Modify: `package.json` (devDep `vitest`, script `"test": "vitest run"`), `vite.config.ts` (`test: { environment: 'node' }`)
- Create: `src/lib/dates.ts`, `src/lib/loyalty.ts`, `src/lib/notifications.ts`, `src/lib/addresses.ts`, `src/lib/reports.ts`, plus `*.test.ts` beside each
- Modify: `src/types/index.ts`

**Interfaces (Produces):**
- Types: `OrderRating { stars: 1|2|3|4|5; tags: string[]; comment?: string; createdAt: string }`; `Order.rating?: OrderRating`; `Order.paymentReceivedAt?: string`; `SavedAddress = Address & { id: string; label: string; isDefault: boolean }`; `User.addresses?: SavedAddress[]`.
- `toDate(v: unknown): Date | null` — accepts Date, ISO string, number, `{toDate()}`, `{seconds}`; else null.
- `computeLoyalty(orders: Order[]): { points: number; tier: 'Bronze'|'Silver'|'Gold'; nextTier: string|null; toNext: number; progress: number }`. Points = Σ floor(Number(totalAmount)||0) over orders with status `completed` or `delivered` + 5 × orders with `rating`. Tiers: Bronze < 300 ≤ Silver < 800 ≤ Gold. `progress` is 0–1 within the current tier (1 at Gold).
- `buildNotifications(orders: Order[], lastSeen: number): AppNotification[]` where `AppNotification { id: string; orderId: string; title: string; icon: string; at: Date; unread: boolean }`. One per statusHistory entry, newest first, max 20; title from `statusLabels`; `unread = at.getTime() > lastSeen`.
- `getSavedAddresses(user: User | null): SavedAddress[]` — returns `user.addresses` if non-empty; else the legacy `user.address` as `{id:'legacy', label:'Home', isDefault:true}` if its street is set; else `[]`. `getDefaultAddress(user): SavedAddress | null`.
- `dailySeries(orders: Order[], days: number, now?: Date): { date: string; label: string; orders: number; revenue: number }[]`; `statusBreakdown(orders): { status: OrderStatus; label: string; count: number }[]` (count > 0 only); `riderAverage(orders, riderId?): { avg: number; count: number }`; `ordersToCsv(orders): string` (header `id,date,customer,rider,service,status,total,payment`; RFC-4180 quoting of commas/quotes/newlines).

- [ ] **Step 1: Write failing tests** — key assertions:
  - `toDate('2026-01-02T00:00:00Z')?.toISOString()` = `'2026-01-02T00:00:00.000Z'`; `toDate({seconds: 0})?.getTime()` = 0; `toDate(undefined)` = null.
  - `computeLoyalty([{status:'completed',totalAmount:120.9}, {status:'completed',totalAmount:200, rating:{…}}, {status:'cancelled',totalAmount:999}, {status:'completed',totalAmount:'abc'}])` → `points` 325, `tier` 'Silver', `nextTier` 'Gold', `toNext` 475.
  - `buildNotifications` on an order whose history has 3 entries with string timestamps, `lastSeen` between entries 1 and 2 → 3 items, newest first, `unread` = [true, true, false]; an order with no `statusHistory` → contributes 0 items, no throw.
  - `getSavedAddresses({address:{street:'1 Jln A',…}})` → length 1, label 'Home', isDefault true; `getSavedAddresses({addresses:[a,b]})` → `[a,b]`; `getSavedAddresses(null)` → `[]`.
  - `dailySeries(orders, 7, new Date('2026-11-17T12:00:00'))` → length 7, last `date` '2026-11-17', revenue excludes cancelled orders; `ordersToCsv` quotes `Lim, Ah "Boy"` as `"Lim, Ah ""Boy"""`.
- [ ] **Step 2:** `npm test` → FAIL (modules missing).
- [ ] **Step 3:** Implement the libs and types.
- [ ] **Step 4:** `npm test` → all PASS; `npm run build` passes.
- [ ] **Step 5:** Commit: `feat: loyalty, notifications, addresses, reports logic with tests`.

### Task 3: App shell, persistent layout, page transitions, toasts, confirm

**Files:**
- Create: `src/components/shell/AppShell.tsx`, `src/components/shell/BottomNav.tsx`, `src/components/shell/Sidebar.tsx`, `src/components/shell/TopBar.tsx`, `src/components/shell/NotificationBell.tsx`, `src/components/shell/navItems.ts`, `src/components/motion.tsx`, `src/components/ConfirmDialog.tsx`, `src/hooks/useNotifications.ts`
- Modify: `src/App.tsx` (layout route, lazy pages, `<Toaster richColors position="top-center"/>`), `src/components/ui/sonner.tsx` if needed
- Delete: `src/components/MainLayout.tsx`, `src/pages/CustomerDashboard.tsx`, `src/pages/RiderDashboard.tsx`

**Interfaces:**
- Consumes: `buildNotifications`, `computeLoyalty` (Task 2); `useUnreadChats`.
- Produces:
  - `AppShell` — layout route element: renders `Sidebar` (`hidden lg:flex`, w-64, logo, nav with a `layoutId="side-ind"` highlight, unread badge on Chats, theme toggle, loyalty mini-card for customers) + `<main>` with `TopBar` + `AnimatePresence mode="wait"` around `<Outlet/>` keyed by `location.pathname` + `BottomNav` (`lg:hidden`, floating rounded-[22px] bar, `layoutId="tab-blob"` highlight) + customer FAB (`lg:hidden`) that opens New Order.
  - `TopBar({ title?: string; subtitle?: string; actions?: ReactNode })` — pages render it at the top of their content, which keeps titles per page. It includes `NotificationBell` and, on desktop for customers, a "New order" button.
  - `useNewOrder(): { open: () => void }` — context from AppShell; it hosts the `CreateOrderDialog`, and on creation shows the toast `Order {id} created`.
  - `motion.tsx`: `PageTransition` (opacity 0→1, y 14→0, 0.35s), `Stagger` + `StaggerItem` (0.05s stagger, y 16→0), `CountUp({ value: number; prefix?: string; decimals?: number })`, `Pressable` (whileTap scale 0.97, whileHover y −2).
  - `useConfirm(): (opts: { title: string; description?: string; confirmText?: string; destructive?: boolean }) => Promise<boolean>` via `ConfirmProvider` mounted in App.
  - `useNotifications(): { items: AppNotification[]; unreadCount: number; markAllRead(): void }` — orders from `useCustomerOrders`/`useRiderOrders`; `lastSeen` in localStorage key `ezl:notif-seen:{uid}` (read/write in try/catch).
  - Routes: public routes outside; `/chat/:orderId` outside the shell below `lg` (inside on desktop, via `useIsMobile`); all other protected routes are children of `<Route element={<ProtectedRoute><AppShell/></ProtectedRoute>}>`, with role guards per child.
- [ ] **Step 1:** Build the shell pieces and route restructure; replace every `alert(`/`window.confirm(` in `src/pages` with `toast.*`/`useConfirm`.
- [ ] **Step 2:** Verify: `grep -rn "alert(\|window.confirm" src/pages src/components` → none; `npm run build && npm run lint` pass.
- [ ] **Step 3:** Browser at 390px and 1280px as a customer: tab highlight slides between tabs (not a jump), pages fade/slide, the bell opens a list, and the chat detail is full-screen on mobile.
- [ ] **Step 4:** Commit: `feat: responsive app shell with page transitions, toasts, confirm`.

### Task 4: Customer Home, Orders, Order Detail tracker

**Files:** Modify `src/pages/CustomerHome.tsx`, `src/pages/Orders.tsx`, `src/pages/OrderDetail.tsx`; Create `src/components/order/OrderTimeline.tsx`, `src/components/order/OrderCard.tsx`, `src/components/order/ActiveOrderHero.tsx`, `src/components/order/Receipt.tsx`, `src/components/Skeletons.tsx`

**Interfaces:**
- Consumes: shell/motion pieces (Task 3), `computeLoyalty`, `toDate`.
- Produces: `OrderTimeline({ order: Order })` — the customer-visible steps `accepted, picking-up, picked-up, at-laundry, washing, washed, delivering, delivered`. Done steps are filled primary with ✓, the current step has a pulsing ring, connectors animate their height, and timestamps come from statusHistory. A cancelled order shows a single red "Cancelled" state. `OrderCard({ order, onRate? })`, `ActiveOrderHero({ order })` (gradient card, live dot, progress bar = index/7), `Receipt({ order })`, `HomeSkeleton`, `ListSkeleton({ rows })`.
- [ ] **Step 1:** Remove the per-page sticky headers (use `TopBar`). Home becomes a two-column `lg:grid-cols-[1.5fr_1fr]`: hero + `CountUp` stats (Active, Completed, Total spent, Points from `computeLoyalty`) + quick actions on the left, recent orders on the right. Orders gets an animated segmented filter (Active/Completed/Cancelled, `layoutId`). OrderDetail: `lg:grid-cols-[1.2fr_1fr]` with timeline left; rider, summary, `Receipt`, actions right.
- [ ] **Step 2:** Verify: build passes; browser shows skeletons then a staggered entrance; the timeline animates; a legacy order without timestamps still renders.
- [ ] **Step 3:** Commit: `feat: redesigned customer home, orders and live tracker`.

### Task 5: New Order sheet + saved addresses

**Files:** Modify `src/components/CreateOrderDialog.tsx`, `src/pages/Profile.tsx`, `src/services/authService.ts` (no new method; use `updateUserData(uid, { addresses, address })`); Create `src/components/profile/AddressManager.tsx`, `src/components/ResponsiveModal.tsx`

**Interfaces:**
- Consumes: `getSavedAddresses`, `getDefaultAddress` (Task 2), `useIsMobile`.
- Produces: `ResponsiveModal({ open, onOpenChange, title, children, footer? })` — vaul `Drawer` below 768px, shadcn `Dialog` above. `AddressManager()` — list with animated radio selection, add/edit (form in a ResponsiveModal), delete (useConfirm), set default; it saves `addresses` and mirrors the default into the legacy `address`.
- [ ] **Step 1:** CreateOrderDialog renders in `ResponsiveModal` with 4 steps (Service → Details & schedule → Address & payment → Review). The progress bar fills each segment with a `scaleX` transition, step content slides horizontally (`AnimatePresence custom={direction}`), and day chips run from today to +6. Address step: pick a saved address card or "Use a new address" (inline form, with an optional "Save to my addresses"). Payment: `cash` | `ewallet` → `paymentMethod`. Success state: animated check, confetti burst (12 motion spans), and a "Track my order" button that navigates to `/order/{id}`.
- [ ] **Step 2:** Profile is redesigned: identity card, loyalty card (tier, `CountUp` points, progress bar), `AddressManager`, a settings list with a dark mode switch, and logout through `useConfirm`.
- [ ] **Step 3:** Verify: build; at 390px the sheet slides up from the bottom and inputs stay visible with the keyboard open (Drawer scrolls); at 1280px it's a centred dialog; a legacy-address user sees "Home" preselected; the created order has the chosen address and paymentMethod.
- [ ] **Step 4:** Commit: `feat: responsive new-order sheet, saved addresses, profile redesign`.

### Task 6: Rating + simulated payment

**Files:** Modify `src/services/orderService.ts`, `src/pages/OrderDetail.tsx`, `src/components/order/OrderCard.tsx`, `src/pages/RiderJobs.tsx`; Create `src/components/order/RateRiderModal.tsx`

**Interfaces:**
- Produces: `orderService.rateOrder(orderId: string, rating: Omit<OrderRating,'createdAt'>): Promise<void>` (throws unless status is `delivered`/`completed` and there's no existing rating; writes `rating`; demo-mode branch like the other methods). `orderService.markPaymentReceived(orderId: string, riderId: string): Promise<void>` (sets `paymentStatus:'paid'`, `paymentReceivedAt`; sends a system chat message "Payment received"). `RateRiderModal({ order, open, onOpenChange, onRated })` — 5 stars that pop in sequence on select, tags `['On time','Friendly','Careful with clothes','Great communication']`, optional comment; toast `Thanks! +5 points`.
- [ ] **Step 1:** Implement both service methods; OrderCard/OrderDetail show "★ Rate rider" for delivered/completed unrated orders and stars when rated. In RiderJobs' delivery step, add a "Payment received (RM x)" button before/with delivery for unpaid orders.
- [ ] **Step 2:** Verify: build; rating an order persists after a refresh; rating twice is impossible (button gone); the Receipt shows "Paid · e-Wallet · {time}".
- [ ] **Step 3:** Commit: `feat: rate rider and simulated payment`.

### Task 7: Rider pages refresh

**Files:** Modify `src/pages/RiderHome.tsx`, `src/pages/RiderJobs.tsx`
- [ ] **Step 1:** Remove the sticky headers (TopBar). RiderHome: online card, `CountUp` stats (today's jobs, earnings = Σ deliveryFee of delivered/completed today, rating from `riderAverage`), staggered available-job cards with Pressable and an accept button that shows a loading state + toast. RiderJobs: animated segmented tabs, swap the spinners for `ListSkeleton`, `ResponsiveModal` for the pickup/delivery forms, and a two-column job list/detail on `lg`.
- [ ] **Step 2:** Verify: build; accept → toast and the job moves to Active with an animation (`AnimatePresence` + `layout`).
- [ ] **Step 3:** Commit: `feat: rider pages redesign`.

### Task 8: Admin pages + charts + CSV

**Files:** Modify `src/pages/AdminDashboard.tsx`, `src/pages/AdminReports.tsx`, `src/pages/AdminUsers.tsx`, `src/pages/UserDetail.tsx`
- **Consumes:** `dailySeries`, `statusBreakdown`, `riderAverage`, `ordersToCsv` (Task 2).
- [ ] **Step 1:** Dashboard: `CountUp` KPIs computed from real orders/users (revenue, orders, active riders = riders with an active order, avg rating) and a recent orders table (cards on mobile). Reports: range toggle 7/30 days; Recharts `AreaChart` (revenue) + `BarChart` (orders/day) + `PieChart` (status breakdown) inside the shadcn `ChartContainer`, theme-aware colours from CSS vars; "Export CSV" downloads `ezlaundry-orders-YYYY-MM-DD.csv` via a Blob. Users: searchable list, staggered rows, delete via `useConfirm` + toast.
- [ ] **Step 2:** Verify: build; charts render in light and dark; the CSV opens with the correct columns.
- [ ] **Step 3:** Commit: `feat: admin dashboard, charts and CSV export`.

### Task 9: Chat polish + final verification

**Files:** Modify `src/pages/Chat.tsx`
- [ ] **Step 1:** Chat list uses TopBar and staggered rows; chat detail message bubbles animate in (y 8→0), and on `lg` it's a centred max-w-3xl panel inside the shell.
- [ ] **Step 2:** `npm test && npm run lint && npm run build` → all pass.
- [ ] **Step 3:** Browser pass as customer, rider and admin at 390px and 1280px, light and dark: no horizontal scroll, no console errors, deep-link refresh works.
- [ ] **Step 4:** Commit: `feat: chat polish`.
