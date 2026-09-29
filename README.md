# AEROLiNK

A district-level disaster-response decision-support **UI prototype** for rainfall-triggered landslides in Wayanad, Kerala.

**Milestone: UI-first demonstration, scoped to the requested first 30–40% of project work.** This is a planning milestone, not a measured percentage of a finished production system. Advanced algorithms, backend services, real routing, and live environmental feeds are deliberately deferred.

## Run locally

Use Node.js 22.13+ (or a current Node 24 LTS release) and npm.

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:3000. No API keys or backend are required. OpenStreetMap tiles require internet access; the scenario overlays and UI continue to work if the base map is unavailable.

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Demonstrable features

- Responsive dark command-center workspace with interactive Leaflet map.
- Six selectable settlement anchors, rainfall context, evidence and access tabs.
- Field-report review with original observations, seeded extraction previews, duplicate and conflict labels.
- Closure verification with a required reason and session audit history.
- Candidate corridor changes and explicit no-route / isolation state.
- Medical-first action queue with demo assignments and resolution state.
- Play, pause, checkpoint selection, advance and reset replay controls.
- Manual simulated report intake; submissions remain pending review and do not change operational state.
- Export a labelled JSON situation brief.
- Data provenance and scope disclosures.

## Data honesty

**All operational data is SIMULATED.** The date is a fictional scenario clock. Rainfall values are authored fixtures, not downloaded historical records. The map background is OpenStreetMap; road polylines are schematic corridors, not extracted OSM routes. Settlement coordinates are approximate anchors. Susceptibility areas are illustrative, not GSI layers. Population remains unknown. There is no live emergency feed.

Risk, confidence and priority are separate. No route is called safe. Duplicates do not imply independent witnesses. Conflicting observations do not silently reopen roads. Current routing behavior is a small declared scenario, not a route engine.

Changes live in React memory for this session. Refreshing clears them; export a brief to retain a demonstration snapshot. Rewinding replay changes the checkpoint while retaining session notes and assignments; Reset clears these working items and retains the session audit history.

## Project structure

```text
src/app/                    Next.js App Router and global styling
src/components/             Dashboard, map, settlement, report and queue UI
src/lib/types.ts            Shared frontend domain contracts
src/lib/scenario.ts         Explicit scenario fixtures and selectors
tests/                      Behavioral invariants for the demo
docs/                       Demo, scope, provenance and team integration guidance
.github/                    CI and pull request template
```

Frontend: Next.js, React, TypeScript, Tailwind CSS, Leaflet / React-Leaflet, Lucide icons. Domain styling is defined in CSS alongside Tailwind. Versions are locked in `package-lock.json`.

Planned backend: Python/FastAPI, SQLite/SQLAlchemy, GeoPandas/Shapely, OSMnx/NetworkX. Planned NLP: Sentence Transformers and scikit-learn. These are **not installed or implemented** for this milestone.

## Team contribution

Repository: https://github.com/atulyavm/Aerolink

Read [CONTRIBUTING.md](CONTRIBUTING.md) before integrating teammates' files. Add contributions on separate branches and combine through reviewed pull requests. Do not overwrite the repository with a folder copy or force-push shared branches.

- [Demonstration walkthrough](docs/DEMO.md)
- [Milestone scope and next work](docs/MILESTONE.md)
- [Data provenance](docs/DATA_PROVENANCE.md)
- [Backend handoff](docs/BACKEND_HANDOFF.md)

## References

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [React-Leaflet installation](https://react-leaflet.js.org/docs/start-installation/)
- [OpenStreetMap attribution and licence](https://www.openstreetmap.org/copyright)
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/)

This prototype is for demonstration and development, not operational emergency decisions.
