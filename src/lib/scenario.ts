import type { Action, FieldReport, Road, Settlement } from "./types";

// All operational values and road geometries below are declared demonstration fixtures.
// Named places are approximate geographic anchors, not surveyed settlement boundaries.
export const settlements: Settlement[] = [
  {
    id: "mundakkai",
    name: "Mundakkai",
    area: "Meppadi sector",
    position: [11.428, 76.168],
    concern: "High concern",
    support: "Moderate support",
    rainfall: [84, 192, 326],
    susceptibility: "Elevated · scenario assumption",
    medical: true,
  },
  {
    id: "chooralmala",
    name: "Chooralmala",
    area: "Meppadi sector",
    position: [11.452, 76.166],
    concern: "High concern",
    support: "Limited support",
    rainfall: [78, 181, 309],
    susceptibility: "Elevated · scenario assumption",
    medical: false,
  },
  {
    id: "meppadi",
    name: "Meppadi",
    area: "Southern sector",
    position: [11.554, 76.135],
    concern: "Watch",
    support: "Moderate support",
    rainfall: [42, 108, 214],
    susceptibility: "Moderate · scenario assumption",
    medical: false,
  },
  {
    id: "vythiri",
    name: "Vythiri",
    area: "Western sector",
    position: [11.551, 76.04],
    concern: "Watch",
    support: "Limited support",
    rainfall: [38, 96, 188],
    susceptibility: "Moderate · scenario assumption",
    medical: false,
  },
  {
    id: "kalpetta",
    name: "Kalpetta",
    area: "Central sector",
    position: [11.609, 76.083],
    concern: "No elevated signal",
    support: "Moderate support",
    rainfall: [21, 64, 142],
    susceptibility: "Unavailable",
    medical: false,
  },
  {
    id: "ambalavayal",
    name: "Ambalavayal",
    area: "Eastern sector",
    position: [11.619, 76.211],
    concern: "Watch",
    support: "Limited support",
    rainfall: [32, 87, 176],
    susceptibility: "Unavailable",
    medical: false,
  },
];

export const scenarioSteps = [
  {
    time: "14:00",
    title: "Environmental watch",
    detail:
      "Seeded rainfall context and reported-open access. No live weather source connected.",
  },
  {
    time: "14:30",
    title: "Blockage reported",
    detail:
      "R17 is suspected blocked. The demo switches to the alternate access corridor.",
  },
  {
    time: "14:45",
    title: "Closure verified",
    detail:
      "Coordinator verification closes R17. The alternate corridor remains a candidate.",
  },
  {
    time: "15:00",
    title: "Last access at risk",
    detail:
      "A blockage is reported on R22. Both access corridors are now excluded by default.",
  },
  {
    time: "15:15",
    title: "Isolation & conflicting evidence",
    detail:
      "R22 closure is verified. A conflicting R17 report arrives; it cannot automatically reopen the road.",
  },
];

export const reports: FieldReport[] = [
  {
    id: "FR-104",
    settlementId: "mundakkai",
    text: "Two people need urgent medical assistance near the community meeting point. Please coordinate a response.",
    source: "Community volunteer · demo",
    time: "14:00",
    kind: "medical",
    incident: "Emergency request",
    need: "Urgent medical assistance",
    appearsAt: 0,
  },
  {
    id: "FR-105",
    settlementId: "mundakkai",
    roadId: "R17",
    text: "Mudslide near the bridge on R17. Cars cannot pass. We are waiting on the Meppadi side.",
    source: "Field responder A · demo",
    time: "14:30",
    kind: "blockage",
    incident: "Reported landslide / blockage",
    need: "Access verification",
    appearsAt: 1,
  },
  {
    id: "FR-106",
    settlementId: "mundakkai",
    roadId: "R17",
    text: "Forwarded: Mudslide near the bridge on R17. Cars cannot pass.",
    source: "Forwarded message · demo",
    time: "14:30",
    kind: "duplicate",
    incident: "Duplicate of FR-105",
    need: "No additional request",
    related: "FR-105",
    appearsAt: 1,
  },
  {
    id: "FR-107",
    settlementId: "mundakkai",
    roadId: "R22",
    text: "Debris across the alternate access corridor R22. Vehicle passage has not been possible.",
    source: "Field responder B · demo",
    time: "15:00",
    kind: "blockage",
    incident: "Road blockage",
    need: "Access restoration review",
    appearsAt: 3,
  },
  {
    id: "FR-108",
    settlementId: "mundakkai",
    roadId: "R17",
    text: "The R17 bridge road looks open from this side. I have not crossed it.",
    source: "Resident report · demo",
    time: "15:15",
    kind: "conflict",
    incident: "Reported open · conflicting evidence",
    need: "Coordinator verification",
    related: "FR-105",
    appearsAt: 4,
  },
];

export function getRoads(step: number): Road[] {
  return [
    {
      id: "R17",
      label: "Primary access corridor",
      state:
        step >= 2
          ? "Confirmed closed"
          : step >= 1
            ? "Suspected blocked"
            : "Reported open",
      points: [
        [11.554, 76.135],
        [11.529, 76.143],
        [11.502, 76.155],
        [11.476, 76.149],
        [11.452, 76.166],
        [11.428, 76.168],
      ],
      evidence:
        step >= 2
          ? "FR-105 · coordinator verified at 14:45"
          : step >= 1
            ? "FR-105 · reported at 14:30"
            : "Seeded open observation · 14:00",
    },
    {
      id: "R22",
      label: "Alternate access corridor",
      state:
        step >= 4
          ? "Confirmed closed"
          : step >= 3
            ? "Suspected blocked"
            : "Unknown",
      points: [
        [11.554, 76.135],
        [11.542, 76.192],
        [11.508, 76.208],
        [11.472, 76.195],
        [11.428, 76.168],
      ],
      evidence:
        step >= 4
          ? "FR-107 · coordinator verified at 15:15"
          : step >= 3
            ? "FR-107 · reported at 15:00"
            : "No recent field observation",
    },
  ];
}

export function getAccess(id: string, step: number) {
  if (id !== "mundakkai")
    return {
      isolated: false,
      label: "Access unverified",
      route: null,
      detail:
        "No route assessment is available for this settlement in the prototype.",
    };
  if (step >= 3)
    return {
      isolated: true,
      label: "Operationally isolated",
      route: null,
      detail: "No usable road route is known under the current information.",
    };
  return {
    isolated: false,
    label: step === 0 ? "Candidate route" : "Alternate · unverified",
    route: step === 0 ? "R17" : "R22",
    detail:
      "Candidate route based on current information. Geometry is schematic; field access must be verified.",
  };
}

export function getActions(step: number): Action[] {
  const access = getAccess("mundakkai", step);
  const actions: Action[] = [
    {
      id: "ACT-01",
      settlementId: "mundakkai",
      priority: "Urgent",
      title: "Coordinate medical assistance",
      reason:
        "Two people need urgent medical help. " +
        (access.isolated
          ? "No usable road access is known; escalate access options."
          : "Verify access before coordinating a response."),
      support: "Limited support",
      access: access.label,
    },
  ];
  if (step >= 3)
    actions.push({
      id: "ACT-04",
      settlementId: "mundakkai",
      priority: "High",
      title: "Escalate loss of road access",
      reason:
        "Both declared access corridors are unavailable under current information.",
      support: step >= 4 ? "Strong support" : "Limited support",
      access: access.label,
    });
  if (step >= 4)
    actions.push({
      id: "ACT-05",
      settlementId: "mundakkai",
      priority: "High",
      title: "Resolve conflicting R17 evidence",
      reason:
        "A reported-open observation conflicts with the verified closure. Verification is required.",
      support: "Limited support",
      access: "Confirmed closed",
    });
  else if (step >= 1 && step < 2)
    actions.push({
      id: "ACT-02",
      settlementId: "mundakkai",
      priority: "High",
      title: "Verify reported R17 blockage",
      reason:
        "One original source and one duplicate. The duplicate is not independent corroboration.",
      support: "Limited support",
      access: "Alternate · unverified",
    });
  else if (step === 3)
    actions.push({
      id: "ACT-06",
      settlementId: "mundakkai",
      priority: "High",
      title: "Verify reported R22 blockage",
      reason: "The last candidate corridor has an unverified blockage report.",
      support: "Limited support",
      access: access.label,
    });
  actions.push({
    id: "ACT-03",
    settlementId: "chooralmala",
    priority: "High",
    title: "Contact settlement representative",
    reason:
      "High environmental concern with limited field evidence. Confirm the local situation.",
    support: "Limited support",
    access: "Access unverified",
  });
  actions.push({
    id: "ACT-07",
    settlementId: "meppadi",
    priority: "Monitor",
    title: "Continue environmental monitoring",
    reason:
      "Watch state in the declared rainfall scenario. Review the next observation window.",
    support: "Moderate support",
    access: "Access unverified",
  });
  return actions;
}

export function visibleReports(step: number) {
  return reports.filter((report) => report.appearsAt <= step);
}

export function reportVerified(id: string, step: number) {
  return (id === "FR-105" && step >= 2) || (id === "FR-107" && step >= 4);
}

export function minutesSince(time: string, step: number) {
  const minutes = (value: string) => {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
  };
  return Math.max(0, minutes(scenarioSteps[step].time) - minutes(time));
}
