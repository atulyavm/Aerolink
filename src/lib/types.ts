export type Concern = "High concern" | "Watch" | "No elevated signal";
export type Support = "Strong support" | "Moderate support" | "Limited support";
export type RoadState =
  "Unknown" | "Reported open" | "Suspected blocked" | "Confirmed closed";
export type Position = [number, number];
export type View =
  | "Overview"
  | "Settlements"
  | "Field reports"
  | "Action queue"
  | "Activity log"
  | "Data sources";

export interface Settlement {
  id: string;
  name: string;
  area: string;
  position: Position;
  concern: Concern;
  support: Support;
  rainfall: [number, number, number];
  susceptibility: string;
  medical: boolean;
}

export interface Road {
  id: string;
  label: string;
  state: RoadState;
  points: Position[];
  evidence: string;
}

export interface FieldReport {
  id: string;
  settlementId: string;
  roadId?: string;
  text: string;
  source: string;
  time: string;
  kind: "blockage" | "medical" | "duplicate" | "conflict";
  incident: string;
  need: string;
  related?: string;
  appearsAt: number;
}

export interface Action {
  id: string;
  settlementId: string;
  priority: "Urgent" | "High" | "Monitor";
  title: string;
  reason: string;
  support: Support;
  access: string;
}

export interface AuditEntry {
  id: string;
  time: string;
  title: string;
  detail: string;
}
