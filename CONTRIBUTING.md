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

`.github/workflows/deploy.yml` runs on every push to `main` (i.e. after a PR is
merged) and on manual dispatch. It deploys the public frontend and the managing
app to Vercel using the Vercel CLI.

It is inert until these are configured under
**Settings → Secrets and variables → Actions**:

| Kind | Name |
| --- | --- |
| Secret | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_FRONTEND`, `VERCEL_PROJECT_ID_MANAGING` |
| Variable | `NEXT_PUBLIC_SITE_URL` (`https://www.roombazar.com`), `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_IMAGE_HOST` |

Each deploy job is skipped (not failed) when its project id is absent. The
NestJS backend is hosted elsewhere and is deployed by its own pipeline.
