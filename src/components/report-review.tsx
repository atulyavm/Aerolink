"use client";

import { Copy, ShieldCheck, TriangleAlert } from "lucide-react";
import type { FieldReport } from "@/lib/types";
import { minutesSince, reportVerified, settlements } from "@/lib/scenario";
import { Badge } from "./ui";

export function ReportReview({
  reports,
  step,
  onVerify,
  onReview,
  reviewed,
}: {
  reports: FieldReport[];
  step: number;
  onVerify: (report: FieldReport) => void;
  onReview: (report: FieldReport) => void;
  reviewed: string[];
}) {
  if (!reports.length)
    return (
      <div className="panel empty-state">
        <ShieldCheck size={30} />
        <h2>No matching reports</h2>
        <p>Try a different search or advance the scenario.</p>
      </div>
    );
  return (
    <div className="report-grid">
      {reports.map((report) => {
        const verified = reportVerified(report.id, step);
        return (
          <article className="panel report-card" key={report.id}>
            <div className="report-top">
              <span className="mono">{report.id}</span>
              <Badge>Simulated</Badge>
              <span className="report-age">
                {minutesSince(report.time, step)} min ago
              </span>
            </div>
            <div className="report-card-title">
              <h2>
                {settlements.find((s) => s.id === report.settlementId)!.name}
              </h2>
              <Badge
                tone={
                  verified
                    ? "green"
                    : report.kind === "conflict"
                      ? "red"
                      : "amber"
                }
              >
                {verified
                  ? "Verified closure"
                  : report.kind === "duplicate"
                    ? "Duplicate"
                    : reviewed.includes(report.id)
                      ? "Reviewed"
                      : "Needs review"}
              </Badge>
            </div>
            <p className="report-source">
              {report.source} · {report.time} IST, scenario clock
            </p>
            <blockquote>“{report.text}”</blockquote>
            <div className="extracted-fields">
              <span className="eyebrow">
                STRUCTURED FIELDS ·{" "}
                {report.id.startsWith("LOCAL")
                  ? "MANUAL INTAKE"
                  : "SEEDED NLP PREVIEW"}
              </span>
              <dl>
                <div>
                  <dt>Incident</dt>
                  <dd>{report.incident}</dd>
                </div>
                <div>
                  <dt>Road</dt>
                  <dd>{report.roadId || "Not specified"}</dd>
                </div>
                <div>
                  <dt>Need</dt>
                  <dd>{report.need}</dd>
                </div>
              </dl>
            </div>
            {report.kind === "duplicate" && (
              <div className="info-note">
                <Copy size={16} />
                <span>
                  Related to {report.related}. Does not count as an independent
                  witness.
                </span>
              </div>
            )}
            {report.kind === "conflict" && (
              <div className="info-note red-note">
                <TriangleAlert size={16} />
                <span>
                  Conflicting evidence — verification required. R17 remains
                  closed until separately verified.
                </span>
              </div>
            )}
            <div className="report-bottom">
              <span className="micro-note">Original report preserved</span>
              {report.kind === "blockage" &&
              !verified &&
              !report.id.startsWith("LOCAL") ? (
                <button
                  className="button button-primary"
                  onClick={() => onVerify(report)}
                >
                  <ShieldCheck size={14} />
                  Verify closure
                </button>
              ) : verified ? (
                <span className="verified">
                  <ShieldCheck size={15} />
                  Coordinator verified
                </span>
              ) : (
                <button
                  className="button"
                  disabled={reviewed.includes(report.id)}
                  onClick={() => onReview(report)}
                >
                  {reviewed.includes(report.id)
                    ? "Review recorded"
                    : "Mark reviewed"}
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
