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
