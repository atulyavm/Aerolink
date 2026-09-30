import assert from "node:assert/strict";
import test from "node:test";
import {
  getRoads,
  reports,
  scenarioSteps,
  settlements,
} from "../src/lib/scenario";

// These checks protect fixture relationships when reports are added or edited.
// They validate data integrity, not whether a reported incident is true.
const settlementIds = new Set(settlements.map((settlement) => settlement.id));
const reportsById = new Map(reports.map((report) => [report.id, report]));

function clockMinutes(value: string, context: string): number {
  assert.match(value, /^(?:[01]\d|2[0-3]):[0-5]\d$/, context);
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

test("report identifiers are nonempty and unique", () => {
  assert.ok(reports.length > 0, "The demonstration needs field evidence");
  const seen = new Set<string>();

  for (const report of reports) {
    assert.ok(report.id.trim(), "A report is missing its identifier");
    assert.equal(report.id, report.id.trim(), "Report IDs must be normalized");
    assert.ok(
      !seen.has(report.id),
      `Duplicate report identifier: ${report.id}`,
    );
    seen.add(report.id);
  }
});

test("reports retain original observations and review context", () => {
  for (const report of reports) {
    for (const field of ["text", "source", "incident", "need"] as const) {
      assert.ok(
        report[field].trim().length > 0,
        `${report.id}: ${field} must be present for coordinator review`,
      );
    }
    assert.ok(
      settlementIds.has(report.settlementId),
      `${report.id}: unknown settlement ${report.settlementId}`,
    );
  }
});

test("report introduction checkpoints are valid and follow the event time", () => {
  for (const report of reports) {
    assert.ok(
      Number.isInteger(report.appearsAt),
      `${report.id}: fractional step`,
    );
    assert.ok(
      report.appearsAt >= 0,
      `${report.id}: negative introduction step`,
    );
    assert.ok(
      report.appearsAt < scenarioSteps.length,
      `${report.id}: introduction is outside the replay`,
    );

    const eventTime = clockMinutes(report.time, `${report.id}: invalid time`);
    const checkpointTime = clockMinutes(
      scenarioSteps[report.appearsAt].time,
      `${report.id}: invalid checkpoint time`,
    );
    assert.ok(
      eventTime <= checkpointTime,
      `${report.id}: cannot introduce evidence before its observation time`,
    );
  }
});

test("road references exist when their reports enter the scenario", () => {
  for (const report of reports) {
    if (!report.roadId) continue;
    const roadIds = new Set(getRoads(report.appearsAt).map((road) => road.id));
    assert.ok(
      roadIds.has(report.roadId),
      `${report.id}: unknown road ${report.roadId}`,
    );
  }
});

test("duplicate and conflicting reports identify their related evidence", () => {
  for (const report of reports) {
    if (report.kind === "duplicate" || report.kind === "conflict") {
      assert.ok(report.related, `${report.id}: missing related report`);
    }
    if (!report.related) continue;

    const original = reportsById.get(report.related);
    assert.ok(original, `${report.id}: missing original ${report.related}`);
    assert.notEqual(
      original.id,
      report.id,
      "Reports cannot reference themselves",
    );
    assert.equal(
      original.settlementId,
      report.settlementId,
      `${report.id}: related evidence belongs to another settlement`,
    );
    assert.equal(
      original.roadId,
      report.roadId,
      `${report.id}: related evidence refers to a different road`,
    );
    assert.ok(
      original.appearsAt <= report.appearsAt,
      `${report.id}: related evidence is not available yet`,
    );
  }
});

test("related-report chains cannot contain cycles", () => {
  for (const report of reports) {
    const visited = new Set<string>();
    let current: (typeof reports)[number] | undefined = report;

    while (current) {
      assert.ok(
        !visited.has(current.id),
        `${report.id}: circular evidence link at ${current.id}`,
      );
      visited.add(current.id);
      if (!current.related) break;
      const parent = reportsById.get(current.related);
      assert.ok(parent, `${current.id}: broken evidence link`);
      current = parent;
    }
  }
});

test("duplicates link directly to an original rather than another copy", () => {
  for (const report of reports.filter((item) => item.kind === "duplicate")) {
    assert.ok(report.related, `${report.id}: missing duplicate origin`);
    const original = reportsById.get(report.related);
    assert.ok(original, `${report.id}: duplicate origin does not exist`);
    assert.notEqual(
      original.kind,
      "duplicate",
      `${report.id}: use the original source, not a chain of forwarded copies`,
    );
  }
});
