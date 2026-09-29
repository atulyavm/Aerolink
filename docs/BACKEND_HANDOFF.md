# Backend integration handoff — proposal only

No backend is required to run this milestone. Keep future Python code in `backend/` rather than replacing the root frontend project. Keep endpoint adapters in a future `src/lib/api/` module. UI components should consume typed results; do not embed server algorithms in rendering code.

`src/lib/types.ts` is the current frontend domain vocabulary. `src/lib/scenario.ts` is the replaceable fixture source. The UI keeps all mutation state in `CommandCenter` for this demonstration.

## Suggested future endpoints (not implemented)

| Endpoint                              | Purpose                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `GET /api/scenarios/{id}/snapshot`    | Scenario clock, provenance, settlements, roads, reports and actions           |
| `POST /api/reports`                   | Preserve original text and structured intake, source, event and received time |
| `POST /api/reports/{id}/verification` | Verified state, coordinator identity, required reason, audit event            |
| `GET /api/settlements/{id}/access`    | Candidate geometry or explicit no-route/unknown status                        |
| `PATCH /api/actions/{id}`             | Assignment/status and required reason for overrides                           |

Agreement on request/response schemas is required before implementation. Errors and unavailable data need explicit UI states; do not silently fall back to simulated data in a live workspace. Each response must identify historical/simulated/live provenance and separate scenario time from wall time.

Road states: `Unknown`, `Reported open`, `Suspected blocked`, `Confirmed closed`. Confidence: `Strong support`, `Moderate support`, `Limited support`. Do not convert these to invented percentages.

Report extraction should preserve its model/method and remain a suggestion. Duplicates should reference an original source; conflicting observations need separate verification. Coordinator review alone must not reopen a confirmed road closure.
