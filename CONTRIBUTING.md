# Contributing to RoomBazar

Changes must be made on a branch and merged through a pull request. Do not
push feature work directly to `main`.

## Workflow

1. Update your local `main` branch.
2. Create a focused branch such as `feature/location-search` or
   `fix/listing-preview`.
3. Commit and push that branch.
4. Open a pull request targeting `main`.
5. Wait for all CI jobs and required reviews to pass before merging.

```bash
git switch main
git pull --ff-only
git switch -c feature/short-description
git push -u origin feature/short-description
```

The CI workflow checks the backend, public frontend, and managing app.

## Protecting `main`

Repository administrators must create a GitHub branch ruleset for `main` with:

- Require a pull request before merging.
- Require approvals before merging.
- Require the `Backend`, `Frontend`, and `Managing app` status checks.
- Require branches to be up to date before merging.
- Block force pushes and branch deletion.
- Do not allow bypassing the ruleset, including for administrators.

The workflow validates branches and pull requests, but GitHub branch protection
is what actually prevents a direct push to `main`.

## Deployment

### Production topology

| App | Host | URL |
| --- | --- | --- |
| Backend (NestJS) | separate host (Render / Railway / etc.) | `https://api.roombazar.com`, global prefix `/api` |
| Frontend (Next.js) | Vercel | `https://www.roombazar.com` |
| Managing (Next.js) | Vercel | `https://manage.roombazar.com` |

The frontend and backend are **separate deployments**. The frontend has no
`app/api` and no rewrites; it reaches the backend at `NEXT_PUBLIC_API_URL`
(`https://api.roombazar.com`) over HTTP, server-side and client-side. A path like
`https://www.roombazar.com/api/...` does not exist and returns the 404 page —
that is expected.

### CD

`.github/workflows/deploy.yml` runs on every push to `main` (i.e. after a PR is
merged) and on manual dispatch. It deploys **all three apps**, in order: backend
first (via a deploy-hook URL), then frontend and managing to Vercel. The frontend
never deploys while a backend deploy is failing — this ordering is what the Phase 2
sitemap incident required (frontend shipped a call to `/api/sitemap/listings`
before that route existed in the deployed backend).

It is inert until these are configured under
**Settings → Secrets and variables → Actions** — each job is *skipped*, not
failed, when its config is absent:

| Kind | Name | For |
| --- | --- | --- |
| Secret | `BACKEND_DEPLOY_HOOK_URL` | backend |
| Secret | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_FRONTEND`, `VERCEL_PROJECT_ID_MANAGING` | frontend + managing |
| Variable | `NEXT_PUBLIC_SITE_URL` (`https://www.roombazar.com`), `NEXT_PUBLIC_API_URL` (`https://api.roombazar.com`), `NEXT_PUBLIC_IMAGE_HOST` | frontend + managing builds |

Until `BACKEND_DEPLOY_HOOK_URL` is set, **anything that changes `backend/` must be
redeployed manually** on the backend host after merging.
