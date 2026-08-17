# RoomBazar — frontend

Next.js 15 (App Router) · TypeScript · Tailwind v4. Talks to a separate backend
over HTTP; there is no `app/api` directory here.

```bash
cp .env.example .env
npm install
npm run dev
```

## Naming rules

These are enforced by convention, not tooling. Keep them consistent.

- **Files and folders outside `src/app` are lowercase with no separators.**
  `listingcard.tsx` — not `ListingCard.tsx`, `listing-card.tsx`, or
  `listing_card.tsx`. No hyphens, no underscores, no camelCase, no PascalCase.
- **Exported React components are PascalCase**, because JSX requires a
  capitalised identifier — `listingcard.tsx` exports `ListingCard`. The rule
  governs paths; the symbol inside is a language constraint.
- **Hooks are `usething.ts`** and export a `useThing` function.
- **Two files keep a hyphen and must not be renamed:** `src/app/not-found.tsx`
  and `src/app/room/[slug]/not-found.tsx`. Next.js matches that exact filename.
  Flattened to `notfound.tsx` they become ordinary unused modules — no error, no
  warning, 404 pages just stop rendering.
- **Route segments under `src/app` keep hyphens** (`/post/basic-details`,
  `/admin/audit-log`). Those strings are URLs rather than filenames, and hyphens
  are the recommended word separator for indexable paths.
- **No `_underscore` folders.** Anything that is not a route lives outside
  `src/app`, which removes the need for private folders entirely.
- **No `(parentheses)` route groups.** See [Layouts](#layouts) for what replaces
  them.
- **`[brackets]` appear only in dynamic routes**, where Next.js gives no
  alternative. Each parameter is a single lowercase word — `[city]`,
  `[locality]`, `[slug]`, `[id]` — so no camelCase leaks into a URL.

## Layout

```
src/
  app/          routes only — if it is not a URL, it does not belong here
  components/   grouped by feature, plus ui/ for primitives
  hooks/        client-side data and behaviour
  lib/          api clients, validation, constants, formatting, seo helpers
  store/        zustand stores for cross-page client state
  types/        shared types mirroring the backend contract
  providers/    react context wrappers mounted near the root
  config/       site metadata, env parsing, navigation definitions
  middleware.ts must sit here, beside app/ — see below
```

## Layouts

Because there are no route groups, the root layout at
[src/app/layout.tsx](src/app/layout.tsx) is deliberately neutral — `html`,
`body`, providers, nothing visual. Anything rendered there would appear on every
page including `/dashboard` and `/admin`, and App Router has no way for a child
layout to escape its parent.

So the three chromes work like this:

| Area | How it gets its chrome |
| --- | --- |
| Public pages | Wrap content in `<SiteShell>` — a plain component, not a layout |
| `/dashboard` | `dashboard/layout.tsx` renders `<DashboardShell>` |
| `/admin` | `admin/layout.tsx` renders `<AdminShell>` |

The cost is one wrapper line per public page. That is the trade for keeping
parentheses out of folder names.

## middleware.ts

It lives at `src/middleware.ts`, a **sibling of `src/app`**. Next.js looks for it
at the project root *or* inside `src` when a `src` directory exists. Put it next
to `next.config.ts` and it is silently ignored — no error, no warning, the auth
gate simply never runs.

Middleware only checks that a session cookie exists. Real authorisation happens
server-side, since a present cookie says nothing about a valid one.

## Tailwind

v4, configured in CSS. There is no `tailwind.config.ts` — design tokens live in
the `@theme` block in [src/app/globals.css](src/app/globals.css).

## What is deliberately absent

No bookings, payments, earnings, or reviews. RoomBazar takes no commission and
never touches money, so those surfaces have no backing feature. See
[../docs/00-product-spec.md](../docs/00-product-spec.md).

No password routes either — auth is phone plus OTP, so there is nothing to
reset.
