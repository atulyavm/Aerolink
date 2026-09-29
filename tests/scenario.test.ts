import assert from "node:assert/strict";
import test from "node:test";
import {
  getAccess,
  getActions,
  getRoads,
  minutesSince,
  reportVerified,
  scenarioSteps,
  visibleReports,
} from "../src/lib/scenario";

test("candidate corridors never cross a suspected blockage or confirmed closure", () => {
  for (let step = 0; step < scenarioSteps.length; step++) {
    const access = getAccess("mundakkai", step);
    if (access.route) {
      const road = getRoads(step).find((road) => road.id === access.route);
      assert.ok(road);
      assert.ok(["Unknown", "Reported open"].includes(road.state));
    }
  }
});

test("a reported blockage switches access before coordinator confirmation", () => {
  assert.equal(getAccess("mundakkai", 0).route, "R17");
  assert.equal(getAccess("mundakkai", 1).route, "R22");
  assert.equal(getRoads(1)[0].state, "Suspected blocked");
  assert.equal(reportVerified("FR-105", 1), false);
  assert.equal(getRoads(2)[0].state, "Confirmed closed");
  assert.equal(reportVerified("FR-105", 2), true);
});

test("loss of both corridors produces isolation and no invented route", () => {
  for (const step of [3, 4]) {
    const access = getAccess("mundakkai", step);
    assert.equal(access.isolated, true);
    assert.equal(access.route, null);
    assert.match(access.detail, /No usable road route is known/);
    assert.ok(getActions(step).some((action) => action.id === "ACT-04"));
  }
});

test("life safety retains first priority even when road access is lost", () => {
  for (let step = 0; step < scenarioSteps.length; step++) {
    assert.equal(getActions(step)[0].id, "ACT-01");
    assert.equal(getActions(step)[0].priority, "Urgent");
  }
});

test("conflicting open reports do not reopen a confirmed closure", () => {
  assert.ok(visibleReports(4).some((report) => report.kind === "conflict"));
  assert.equal(getRoads(4)[0].state, "Confirmed closed");
  assert.ok(getActions(4).some((action) => action.id === "ACT-05"));
});

test("duplicate report remains related to the original and gives no stronger support", () => {
  assert.equal(
    visibleReports(1).find((r) => r.kind === "duplicate")?.related,
    "FR-105",
  );
  assert.equal(
    getActions(1).find((a) => a.id === "ACT-02")?.support,
    "Limited support",
  );
});

test("replay never reveals later fixture reports early", () => {
  assert.equal(visibleReports(0).length, 1);
  assert.ok(!visibleReports(2).some((r) => r.id === "FR-107"));
  assert.ok(!visibleReports(3).some((r) => r.kind === "conflict"));
});

test("unmodeled settlements remain unassessed rather than claimed reachable", () => {
  const access = getAccess("kalpetta", 4);
  assert.equal(access.route, null);
  assert.equal(access.label, "Access unverified");
  assert.equal(access.isolated, false);
});

test("evidence age uses scenario time instead of current wall time", () => {
  assert.equal(minutesSince("14:30", 4), 45);
  assert.equal(minutesSince("14:30", 1), 0);
});
