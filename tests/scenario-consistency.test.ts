import assert from "node:assert/strict";
import test from "node:test";
import {
  getActions,
  getRoads,
  reports,
  scenarioSteps,
  settlements,
  visibleReports,
} from "../src/lib/scenario";

// Cross-record checks for this single-day demonstration. These do not validate
// geographic accuracy, rainfall thresholds, or real-world route safety.
function assertCoordinate(position: number[], context: string): void {
  assert.equal(
    position.length,
    2,
    `${context}: expected [latitude, longitude]`,
  );
  const [latitude, longitude] = position;
  assert.ok(Number.isFinite(latitude), `${context}: invalid latitude`);
  assert.ok(Number.isFinite(longitude), `${context}: invalid longitude`);
  assert.ok(
    Math.abs(latitude) <= 90,
    `${context}: latitude outside WGS84 range`,
  );
  assert.ok(
    Math.abs(longitude) <= 180,
    `${context}: longitude outside WGS84 range`,
  );
}

test("single-day replay checkpoints are strictly chronological", () => {
  assert.ok(scenarioSteps.length > 1, "Replay needs multiple checkpoints");
  let previousMinutes = -1;

  for (const checkpoint of scenarioSteps) {
    assert.match(checkpoint.time, /^(?:[01]\d|2[0-3]):[0-5]\d$/);
    const [hours, minutes] = checkpoint.time.split(":").map(Number);
    const currentMinutes = hours * 60 + minutes;
    assert.ok(
      currentMinutes > previousMinutes,
      `${checkpoint.title}: duplicate or out-of-order scenario time`,
    );
    assert.ok(checkpoint.title.trim(), "Checkpoint title must be visible");
    assert.ok(
      checkpoint.detail.trim(),
      "Checkpoint changes need an explanation",
    );
    previousMinutes = currentMinutes;
  }
});

test("settlement markers have unique identities and valid coordinate ranges", () => {
  const seen = new Set<string>();
  assert.ok(settlements.length > 0, "The map needs settlement anchors");

  for (const settlement of settlements) {
    assert.ok(settlement.id.trim(), "Missing settlement ID");
    assert.ok(
      !seen.has(settlement.id),
      `Repeated settlement: ${settlement.id}`,
    );
    assert.ok(settlement.name.trim(), `${settlement.id}: missing map label`);
    assertCoordinate(settlement.position, settlement.id);
    seen.add(settlement.id);
  }
});

test("nested rainfall windows contain nonnegative, consistent accumulations", () => {
  for (const settlement of settlements) {
    assert.equal(
      settlement.rainfall.length,
      3,
      `${settlement.id}: missing window`,
    );
    for (const rainfall of settlement.rainfall) {
      assert.ok(
        Number.isFinite(rainfall),
        `${settlement.id}: nonfinite rainfall`,
      );
      assert.ok(rainfall >= 0, `${settlement.id}: negative accumulation`);
    }

    const [sixHours, day, threeDays] = settlement.rainfall;
    assert.ok(
      sixHours <= day,
      `${settlement.id}: 6h rainfall exceeds 24h total`,
    );
    assert.ok(
      day <= threeDays,
      `${settlement.id}: 24h rainfall exceeds 72h total`,
    );
  }
});

test("road polylines have unique IDs and at least one nonzero segment", () => {
  for (let step = 0; step < scenarioSteps.length; step++) {
    const roads = getRoads(step);
    const seen = new Set<string>();

    for (const road of roads) {
      assert.ok(road.id.trim(), `Step ${step}: missing road ID`);
      assert.ok(!seen.has(road.id), `Step ${step}: duplicate road ${road.id}`);
      assert.ok(road.points.length >= 2, `${road.id}: cannot render a segment`);
      road.points.forEach((point, index) =>
        assertCoordinate(point, `${road.id} point ${index}`),
      );
      assert.ok(
        road.points.some(
          (point) =>
            point[0] !== road.points[0][0] || point[1] !== road.points[0][1],
        ),
        `${road.id}: every point is identical`,
      );
      seen.add(road.id);
    }
  }
});

test("road evidence references available reports for the same corridor", () => {
  for (let step = 0; step < scenarioSteps.length; step++) {
    const available = new Map(
      visibleReports(step).map((report) => [report.id, report]),
    );
    for (const road of getRoads(step)) {
      assert.ok(
        road.evidence.trim(),
        `${road.id}: missing evidence explanation`,
      );
      // Seeded open observations and unknown states need not cite field reports.
      for (const reportId of road.evidence.match(/\bFR-\d+\b/g) ?? []) {
        const evidence = available.get(reportId);
        assert.ok(
          evidence,
          `${road.id}: unavailable evidence ${reportId} at ${step}`,
        );
        assert.equal(
          evidence.roadId,
          road.id,
          `${road.id}: evidence road mismatch`,
        );
      }
    }
  }
});

test("action IDs are unique per checkpoint and retain their task identity", () => {
  const settlementIds = new Set(settlements.map((settlement) => settlement.id));
  const identities = new Map<string, { settlementId: string; title: string }>();

  for (let step = 0; step < scenarioSteps.length; step++) {
    const seen = new Set<string>();
    for (const action of getActions(step)) {
      assert.ok(action.id.trim(), `Step ${step}: missing action ID`);
      assert.ok(
        !seen.has(action.id),
        `Step ${step}: duplicate action ${action.id}`,
      );
      assert.ok(
        settlementIds.has(action.settlementId),
        `${action.id}: missing settlement`,
      );
      assert.ok(
        action.reason.trim(),
        `${action.id}: missing priority explanation`,
      );
      assert.ok(action.access.trim(), `${action.id}: missing access context`);
      const identity = {
        settlementId: action.settlementId,
        title: action.title,
      };
      if (identities.has(action.id)) {
        assert.deepEqual(
          identity,
          identities.get(action.id),
          `${action.id}: reused for a different task`,
        );
      }
      identities.set(action.id, identity);
      seen.add(action.id);
    }
  }
});

test("replaying checkpoints in reverse does not mutate fixture records", () => {
  const originalFixtures = structuredClone({
    reports,
    settlements,
    scenarioSteps,
  });
  const snapshots = scenarioSteps.map((_, step) =>
    structuredClone({
      roads: getRoads(step),
      actions: getActions(step),
      reports: visibleReports(step),
    }),
  );

  for (let step = scenarioSteps.length - 1; step >= 0; step--) {
    assert.deepEqual(
      {
        roads: getRoads(step),
        actions: getActions(step),
        reports: visibleReports(step),
      },
      snapshots[step],
      `Step ${step}: output depends on previous replay navigation`,
    );
  }
  assert.deepEqual({ reports, settlements, scenarioSteps }, originalFixtures);
});
