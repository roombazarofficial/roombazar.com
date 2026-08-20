# RoomBazar — management console

The super admin console. A **separate Next.js application** from the public
site, deployed to its own hostname.

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:3100
```

Requires the API running at `NEXT_PUBLIC_API_URL`, and a `rb_session` cookie
belonging to an account with the `superadmin` role.

## Why a separate app rather than a route in the public site

Three reasons, in order of how much they matter:

1. **Cookie isolation.** Cookies scoped to this hostname are never sent to the
   public site, and vice versa. An XSS in a listing description therefore cannot
   read an operator session — the failure that turns a content bug into a full
   takeover.
2. **It is unreachable from the public domain.** Not merely unlinked: there is
   no route to it. It cannot turn up in a crawl or a wordlist scan of the main
   site because it is not deployed there.
3. **Independent deploys.** The console can ship without touching the site that
   seekers use, and a mistake here cannot take listings offline.

## Layout

```
src/
  app/            routes — one screen per folder, no /managing prefix
  components/
    managing/     console screens
    ui/           the primitives it needs, copied from the public site
  lib/
    api/          the /superadmin client
    format/       rupee formatting
    utils/        class merging
  types/          shapes mirroring the API
  middleware.ts   session gate — must stay a sibling of app/
```

### On the duplicated `ui/` and `types/`

These are copies of the public site's, not a shared package. That is a real
trade: a fix to `button.tsx` has to be made twice, and the two will drift.

It buys full isolation — this app has no build-time dependency on the public
site, so it can be deployed, versioned and rolled back on its own. If the drift
becomes a problem, the fix is a shared workspace package, not an import across
directory boundaries.

## Authentication

There is no sign-in UI here. `middleware.ts` checks only that a session cookie
is present and otherwise redirects to the public site's sign-in.

The cookie's validity, and whether the account is actually a super admin, are
the API's judgement — it refuses every `/superadmin` route for anyone else and
the screens render that refusal rather than data. Checking here would put a
network call in front of every page render for something that has to be enforced
server-side regardless.

## Never indexed

Three overlapping guards, because a console on a real hostname will eventually
be found by something:

- `robots: { index: false, follow: false }` in the root layout
- `X-Robots-Tag` header from `next.config.ts`, covering every route
- the same header set again in middleware

`Referrer-Policy: no-referrer` is also set, so an operator following a link out
does not leak the console's hostname.

## Deploying

Point the hostname (`manage.roombazar.com`, say) at this app. Then add its
origin to the API's `CORS_ORIGINS`, or every request from it fails preflight.
