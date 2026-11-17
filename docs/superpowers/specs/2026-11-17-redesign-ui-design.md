# ezLaundry UI/UX Redesign — Design

**Date:** 2026-11-17 · **Branch:** `redesign-ui` · **Approved mockup:** `../design-mockup.html` (repo parent folder)

## Intent

ezLaundry is a portfolio/demo piece. The goal is for it to feel finished and polished on both mobile and desktop: smooth motion, a proper desktop layout, and the half-built features made to look complete. Real payments and production-grade security are out of scope.

## Goals

- Responsive app shell: a floating bottom tab bar (with a sliding highlight) plus a ＋ button on mobile; a sidebar (with a sliding highlight) on desktop (`lg` and up). The shell persists across routes, so nav animations actually play.
- Motion: page transitions between routes, staggered card entrances, count-up stats, press feedback, skeleton loaders. Honours `prefers-reduced-motion`.
- Light/dark theme, using shared colour tokens instead of hard-coded hex.
- Sonner toasts replace `alert()`; an AlertDialog-based confirm replaces `window.confirm()`.
- Animated order tracker timeline on Order Detail.
- New Order: a bottom sheet (vaul Drawer) on mobile and a Dialog on desktop, with an animated stepper and a success animation.
- Notifications bell, built from the user's order status history and unread chats. No new collection; "last seen" is kept in localStorage.
- Rate rider (stars + tags + optional comment) after an order is delivered or completed, saved on the order. Average rating shown to riders and admins.
- Multiple saved addresses (label + address, one default) in Profile, selectable in New Order.
- Real loyalty points calculated from completed orders (1 pt per RM + 5 per review), with tiers.
- Simulated payment: the customer picks cash or e-wallet; the rider marks payment received; a receipt block appears on Order Detail.
- Admin: Recharts charts (orders/revenue over time, status breakdown), real stats, CSV export.
- Cleanup: delete the unused `CustomerDashboard.tsx` and `RiderDashboard.tsx`, lazy-load routes.

## Non-goals

- One-tap demo login (explicitly rejected by the user).
- Real payment gateway, Firestore security rules, push notifications.
- Landing page redesign (it already animates). It stays light-only.
- Pickup photo capture.

## Anti-goals

- Breaking the existing order flow, chat, or Firebase data. New fields are optional and old documents must still render.
- Animation that slows down or blocks interaction (keep durations ≤ 0.5s, no layout-thrashing loops).

## Constraints

- Stack stays the same: React 19, Vite, Tailwind 3, shadcn, Framer Motion, Firebase (real project configured in `.env`).
- Brand stays the same: primary `#1188E9`, navy `#092635`, teal `#1A7A7E`, Inter + Poppins.
- Firestore rules aren't in the repo. Writes only go to collections/documents the app already writes (`users/{uid}`, `orders/{id}`).

## Approaches considered

1. **Upgrade in place (chosen):** shared foundation (tokens, shell, motion primitives, toasts), then a page-by-page refresh. Low risk, keeps working logic.
2. **Full redesign:** rebuild every page. Rejected: about twice the work, and rewiring the order/chat logic risks bugs.
3. **Light touch:** CSS-only animation. Rejected: doesn't fix the desktop layout.

## Key decisions

- **Colour tokens via codemod:** `text-[#092635]`→`text-foreground`, `text-[#4A6375]`→`text-muted-foreground`, `bg-[#1188E9]`→`bg-primary`, `text-[#1188E9]`→`text-primary`, `border-[#D8E5EF]`→`border-border`, `bg-[#F5F7F9]`→`bg-background`, `bg-white`→`bg-card`, `bg-[#E6F4FF]`→`bg-primary/10`, and so on. Applied to `src/pages` and `src/components` only, not the landing `src/sections`. Status chip colours get `dark:` variants.
- **Theme:** `next-themes` with the `class` strategy; forced light on public routes (landing, login, register). Toggle lives in Profile and the desktop sidebar.
- **Routing:** an app layout route renders the shell once with `<Outlet/>`, wrapped in `AnimatePresence` keyed by pathname. Full-screen chat stays outside the shell on mobile.
- **Data additions (all optional):** `Order.rating?: { stars, tags[], comment?, createdAt }`, `Order.paymentReceivedAt?`, `User.addresses?: SavedAddress[]` (`{ id, label, isDefault } & Address`). `User.address` remains the default for backward compatibility.

## Left to the builder

Exact copy, spacing, icon choices, chart types per admin panel, and how each existing page header adapts to the shell. Match the mockup's feel.
