"use client";

import { useState } from "react";
import {
  ArrowRight,
  CloudRain,
  Info,
  MapPin,
  Mountain,
  Route,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  getAccess,
  getRoads,
  minutesSince,
  visibleReports,
} from "@/lib/scenario";
import type { Settlement } from "@/lib/types";
import { Badge, SupportBadge } from "./ui";

export function SettlementDetail({
  settlement,
  step,
  onReports,
  onRoute,
  showRoute,
}: {
  settlement: Settlement;
  step: number;
  onReports: () => void;
  onRoute: () => void;
  showRoute: boolean;
}) {
  const [tab, setTab] = useState("Situation");
  const access = getAccess(settlement.id, step);
  const localReports = visibleReports(step).filter(
    (r) => r.settlementId === settlement.id,
  );
  return (
    <section
      className="panel settlement-detail"
      aria-label="Selected settlement details"
    >
      <div className="detail-top">
        <span className="eyebrow">SETTLEMENT INTELLIGENCE</span>
        <MapPin size={15} />
      </div>
      <div className="detail-heading">
        <div>
          <h2>{settlement.name}</h2>
          <p>
            {settlement.area} <span>·</span> Wayanad
          </p>
        </div>
        <span className="settlement-code">
          {settlement.id.slice(0, 3).toUpperCase()}
        </span>
      </div>
      <div className="detail-badges">
        <Badge
          tone={
            settlement.concern === "High concern"
              ? "red"
              : settlement.concern === "Watch"
                ? "amber"
                : "green"
          }
        >
          {settlement.concern}
        </Badge>
        <Badge>Simulated</Badge>
      </div>
      <div
        className="detail-tabs"
        role="tablist"
        aria-label="Settlement information"
      >
        {["Situation", "Evidence", "Access"].map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="detail-body" role="tabpanel" aria-label={tab}>
        {tab === "Situation" && (
          <>
            <div className="section-label">
              <CloudRain size={15} />
              Accumulated rainfall<Badge>Seeded</Badge>
            </div>
            <div className="rainfall-grid">
              {settlement.rainfall.map((rain, i) => (
                <div key={i}>
                  <span>{[6, 24, 72][i]} HOURS</span>
                  <strong>
                    {rain}
                    <small> mm</small>
                  </strong>
                  <div className="rain-meter">
                    <i style={{ width: `${Math.min(100, rain / 3.5)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="terrain-row">
              <Mountain size={17} />
              <div>
                <span>Terrain susceptibility</span>
                <p>{settlement.susceptibility}</p>
              </div>
            </div>
            <div className="detail-divider" />
            <div className="section-label">
              <ShieldCheck size={15} />
              Evidence strength
            </div>
            <SupportBadge value={settlement.support} />
            <p className="explanation">
              {settlement.id === "mundakkai"
                ? "Seeded environmental context and field observations. Support is assessed per claim; duplicate reports add no independent support."
                : "Demonstration assessment only. Local conditions and population have not been independently verified."}
            </p>
            <button className="text-button" onClick={() => setTab("Evidence")}>
              Inspect supporting evidence <ArrowRight size={13} />
            </button>
            <div
              className={`access-summary ${access.isolated ? "isolated" : ""}`}
            >
              <Route size={17} />
              <div>
                <strong>{access.label}</strong>
                <p>
                  {access.isolated
                    ? "Escalate access options for coordinator review."
                    : settlement.id === "mundakkai"
                      ? `${access.route} · candidate access corridor`
                      : "Road assessment unavailable"}
                </p>
              </div>
            </div>
            {settlement.medical && (
              <div className="medical-need">
                <span className="medical-icon">+</span>
                <div>
                  <strong>Urgent medical request</strong>
                  <p>2 people · simulated request FR-104</p>
                </div>
              </div>
            )}
            <button
              className="button button-primary full-width"
              onClick={onReports}
            >
              Review field evidence <ArrowRight size={15} />
            </button>
          </>
        )}
        {tab === "Evidence" && (
          <>
            <div className="info-note">
              <Info size={16} />
              <span>
                Evidence support describes a claim, not a person’s truthfulness.
                All assessments here are seeded.
              </span>
            </div>
            <dl className="evidence-facts">
              <div>
                <dt>Source</dt>
                <dd>Declared scenario fixtures</dd>
              </div>
              <div>
                <dt>Population</dt>
                <dd>Unknown / unavailable</dd>
              </div>
              <div>
                <dt>Location relevance</dt>
                <dd>Approximate named settlement</dd>
              </div>
              <div>
                <dt>Independent corroboration</dt>
                <dd>
                  {settlement.id === "mundakkai"
                    ? "Not established for FR-105"
                    : "Unavailable"}
                </dd>
              </div>
            </dl>
            <h3 className="small-heading">Supporting observations</h3>
            {localReports.length === 0 ? (
              <p className="empty-inline">
                No field reports for this settlement.
              </p>
            ) : (
              localReports.map((r) => (
                <div className="evidence-item" key={r.id}>
                  <span className="mono">{r.id}</span>
                  <Badge tone={r.kind === "conflict" ? "red" : "neutral"}>
                    {r.kind}
                  </Badge>
                  <p>{r.incident}</p>
                  <small>
                    {minutesSince(r.time, step)} min ago · scenario time
                  </small>
                </div>
              ))
            )}
            <button className="button full-width" onClick={onReports}>
              Open report review <ArrowRight size={14} />
            </button>
          </>
        )}
        {tab === "Access" && (
          <>
            <div className={`info-note ${access.isolated ? "red-note" : ""}`}>
              <TriangleAlert size={17} />
              <span>{access.detail}</span>
            </div>
            <p className="explanation">
              Demonstration vehicle: light response vehicle. Road direction and
              vehicle restrictions are not evaluated in this UI milestone.
            </p>
            {settlement.id === "mundakkai" ? (
              getRoads(step).map((r) => (
                <div className="road-card" key={r.id}>
                  <div>
                    <strong>{r.id}</strong>
                    <Badge
                      tone={
                        r.state === "Confirmed closed"
                          ? "red"
                          : r.state === "Suspected blocked"
                            ? "amber"
                            : "neutral"
                      }
                    >
                      {r.state}
                    </Badge>
                  </div>
                  <p>{r.label}</p>
                  <small>{r.evidence}</small>
                </div>
              ))
            ) : (
              <p className="empty-inline">
                No route model for this settlement yet.
              </p>
            )}
            <button
              className="button button-primary full-width"
              disabled={!access.route}
              onClick={onRoute}
            >
              <Route size={15} />
              {!access.route
                ? "No candidate route"
                : showRoute
                  ? "Hide candidate route"
                  : "Show candidate route"}
            </button>
            <p className="micro-note">
              Confirmed closures are excluded. Suspected blockages are avoided.
              Unknown corridors remain unverified.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
