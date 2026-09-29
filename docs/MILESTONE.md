# UI-first milestone scope

The requested “30–40%” is interpreted as a bounded demonstration milestone, not an evidence-based completion estimate for the full specification.

## Implemented

| Feature           | Present behavior                                                           |
| ----------------- | -------------------------------------------------------------------------- |
| Command dashboard | Responsive navigation, scenario banner, summary cards, map and panels      |
| Settlement views  | Six anchors, concern/support, seeded 6/24/72h rainfall, unknown population |
| Evidence          | Original text, source, scenario age, duplicates, conflicts and explanation |
| Verification      | Required coordinator reason, checkpoint state update and session audit     |
| Roads/access      | Four road states represented; two-corridor demo and explicit isolation     |
| Priorities        | Declared fixture rules; urgent medical need first, then access escalation  |
| Actions           | Demo assignment/resolution selection; no messages or dispatch              |
| Replay            | Five checkpoints, play/pause, advance, rewind and reset                    |
| Intake/export     | Simulated manual reports and JSON situation brief                          |
| Team readiness    | Shared types, module boundaries, contribution workflow and CI              |

## Deliberately deferred

- FastAPI endpoints, authentication, roles and durable SQLite audit storage.
- Real rainfall feeds and accumulation, validated deterministic thresholds.
- GSI ingestion, licence/coverage checks and spatial matching.
- OSM extraction, road graph routing, direction/access/vehicle restrictions.
- Evidence scoring and real NLP extraction, similarity or conflict detection.
- LoRa or ESP32 integration.
- Operational deployment and 20-scenario / 100-route evaluation.

## Next development slices

1. Agree on contracts with backend contributors and replace fixture selectors with API adapters.
2. Persist reports, verification and assignments with event/received timestamps and audit provenance.
3. Connect documented environmental and terrain sources; retain unavailable states where data is missing.
4. Add an actual OSM road graph and vehicle-aware access calculations.
5. Integrate NLP as reviewable suggestions, never authoritative road or warning state.
6. Run the specified evaluation with fixed units, independent labels and baselines.

Current tests cover UI scenario invariants only. No precision, recall, route-validity percentage or predictive claim is made.
