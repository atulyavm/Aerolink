# Combining team contributions safely

## Working agreement

Clone the shared repository and work on one branch per feature. Preserve existing files and history. The integrator should merge contributions in small batches, verify each one, then push normally. Never force-push `main`, reset over someone else's work, or replace the repository with an uploaded project folder.

Suggested module ownership (coordinate with the team; not an assignment):

| Area        | Location                       | Integration boundary                                      |
| ----------- | ------------------------------ | --------------------------------------------------------- |
| Frontend    | `src/components`, `src/app`    | Shared types in `src/lib/types.ts`                        |
| API/backend | `backend/` (future)            | Proposed contract in `docs/BACKEND_HANDOFF.md`            |
| GIS/data    | `data/` (future)               | Provenance, licence and CRS must accompany data           |
| Evaluation  | `tests/`, future backend tests | Distinguish fixture behavior from measured performance    |
| Hardware    | `hardware/` (future)           | Structured reporting input; no automatic verified closure |

## Start a contribution

```bash
git clone https://github.com/atulyavm/Aerolink.git
cd Aerolink
git switch main
git pull --ff-only origin main
git switch -c feature/your-feature
npm ci
```

Edit only your feature's files. When changing shared types, discuss the contract with the frontend/backend contributors first. Keep the root `package.json` and lockfile together. Do not commit secrets, generated output, dependencies, virtual environments, personal datasets, or local databases.

```bash
git status
git diff
git add path/to/your/files
git commit -m "Describe the contribution"
git push -u origin feature/your-feature
```

Create a pull request targeting `main`. Include changed behavior, checks performed, and any contract changes. Ask another team member to review shared-file changes.

## Integrator checklist

1. Inventory each contribution: author, branch or commit, expected files, dependencies, and overlap. Unprovided files cannot be included or verified.
2. Start from an up-to-date `main` and a clean working tree. Commit local work to a branch before starting a merge; do not discard it.
3. Fetch the team branches with `git fetch origin` and create an `integration/<milestone>` branch from `origin/main`.
4. Merge one reviewed feature branch at a time using `git merge origin/feature/your-feature`.
5. If Git reports conflicts, inspect both changes. Resolve the intended combined behavior; do not blindly choose “ours” or “theirs”. Ask the author when intent is unclear. `git merge --abort` safely exits the current merge if needed.
6. Review `git diff origin/main...HEAD --stat` against the inventory. Confirm added assets and dependency changes have not been omitted.
7. Run `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` and the demo walkthrough. Run backend checks once backend contributions exist.
8. Push the integration branch normally and open one integration PR. Merge only after review/checks. If remote advances, fetch and integrate those changes; never force an overwrite.
9. Teammates pull the merged `main` before starting the next feature.

## If someone supplies loose files or a ZIP

Retain the original package. Inventory files before copying. Put the contribution on its own branch from the current shared base. Add new files directly; compare overlapping files and merge edits selectively. Do not copy a `.git`, `node_modules`, `.next`, secrets or virtual environment into this repository. Confirm the expected file list with the contributor before merging.

## Lockfile conflicts

First combine the intended dependency changes in `package.json`. Then run `npm install` to regenerate the lockfile and review the diff. Commit both files. Never delete dependency declarations merely to make a merge pass.

## UI checks

The workflow must preserve unknown data, visible conflicts, separate risk/support/priority, simulation labels, excluded closed roads and explicit isolation. Tests validate only the declared demo, not operational performance.
