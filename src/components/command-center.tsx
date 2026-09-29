"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  FileText,
  LayoutDashboard,
  MapPin,
  Menu,
  Mountain,
  Pause,
  Play,
  Plus,
  Radio,
  RotateCcw,
  Route,
  Search,
  ShieldCheck,
  SkipForward,
  SlidersHorizontal,
  TriangleAlert,
  Users,
  Waypoints,
  X,
} from "lucide-react";
import {
  getAccess,
  getActions,
  getRoads,
  scenarioSteps,
  settlements,
  visibleReports,
} from "@/lib/scenario";
import type { AuditEntry, FieldReport, View } from "@/lib/types";
import { ActionQueue } from "./action-queue";
import { ReportReview } from "./report-review";
import { SettlementDetail } from "./settlement-detail";
import { Badge, PanelHeader, SupportBadge } from "./ui";

const OperationsMap = dynamic(() => import("./operations-map"), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <Waypoints size={28} />
      <p>Preparing the operational map…</p>
    </div>
  ),
});
const navItems: { name: View; icon: typeof Activity }[] = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Settlements", icon: MapPin },
  { name: "Field reports", icon: Radio },
  { name: "Action queue", icon: SlidersHorizontal },
  { name: "Activity log", icon: Activity },
];
const subtitles: Record<View, string> = {
  Overview: "A connected view. A coordinated response.",
  Settlements:
    "Environmental concern, ground evidence, and accessibility in one place.",
  "Field reports": "Understand the observation. Verify the evidence.",
  "Action queue": "Explainable priorities, with the coordinator in control.",
  "Activity log": "Trace the decisions behind every change.",
  "Data sources":
    "Know where the information comes from — and what is still unknown.",
};

export function CommandCenter() {
  const [view, setView] = useState<View>("Overview");
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState("mundakkai");
  const [showRoute, setShowRoute] = useState(true);
  const [query, setQuery] = useState("");
  const [reportFilter, setReportFilter] = useState("All reports");
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [localReports, setLocalReports] = useState<FieldReport[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [modal, setModal] = useState<
    "report" | "guide" | "verify" | "reset" | null
  >(null);
  const [verificationReport, setVerificationReport] =
    useState<FieldReport | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const settlement = settlements.find((s) => s.id === selected)!;
  const actions = getActions(step);
  const allReports = [
    ...visibleReports(step),
    ...localReports.filter((report) => report.appearsAt <= step),
  ];
  const roads = getRoads(step);
  const current = scenarioSteps[step];

  function record(title: string, detail: string, time = current.time) {
    setAudit((entries) => [
      { id: crypto.randomUUID(), time, title, detail },
      ...entries,
    ]);
  }
  function notify(message: string) {
    setToast(message);
  }
  function navigate(next: View) {
    setView(next);
    setQuery("");
    setMobileNav(false);
  }
  function selectSettlement(id: string) {
    setSelected(id);
    setView("Overview");
    setQuery("");
  }
  function changeStep(next: number) {
    setStep(next);
    record(
      scenarioSteps[next].title,
      `Replay event · ${scenarioSteps[next].detail}`,
      scenarioSteps[next].time,
    );
  }
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(
      () =>
        setStep((previous) => Math.min(previous + 1, scenarioSteps.length - 1)),
      8000,
    );
    return () => clearInterval(interval);
  }, [playing]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (modal && !dialog.current?.open) dialog.current?.showModal();
    if (!modal && dialog.current?.open) dialog.current?.close();
  }, [modal]);

  function exportBrief() {
    const brief = {
      product: "Aerolink UI prototype",
      provenance:
        "SIMULATED — all operational values are fixtures, not an emergency bulletin",
      scenarioClock: `2026-06-10 ${current.time} IST`,
      scenarioStep: current.title,
      settlements,
      roads,
      reports: allReports,
      actions,
      assignments,
      coordinatorHistory: audit,
      limitations: [
        "Schematic corridors; no real routing",
        "No live weather or GSI integration",
        "No backend persistence",
        "No automated NLP processing",
      ],
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(brief, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "aerolink-simulated-brief.json";
    link.click();
    URL.revokeObjectURL(url);
    record(
      "Situation brief exported",
      "Downloaded simulated scenario state as JSON.",
    );
    notify("Simulated situation brief downloaded.");
  }

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = String(form.get("observation") || "").trim();
    if (!text) return;
    const id = `LOCAL-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const location = String(form.get("settlement"));
    setLocalReports((previous) => [
      ...previous,
      {
        id,
        settlementId: location,
        text,
        source: "Manual demo intake",
        time: current.time,
        kind: form.get("type") === "medical" ? "medical" : "blockage",
        incident:
          form.get("type") === "medical"
            ? "Medical request · unverified"
            : "Field observation · unverified",
        need: "Coordinator review required",
        appearsAt: step,
      },
    ]);
    record(
      "Simulated report added",
      `${id} · ${location}. Manual intake only; no automatic road or priority changes.`,
    );
    setModal(null);
    setView("Field reports");
    setQuery("");
    setReportFilter("All reports");
    notify("Report added for review. Operational states are unchanged.");
  }

  function verifyReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verificationReport) return;
    const reason = String(
      new FormData(event.currentTarget).get("reason") || "",
    ).trim();
    if (!reason) return;
    const next = Math.max(step, verificationReport.roadId === "R17" ? 2 : 4);
    setStep(next);
    setPlaying(false);
    record(
      `${verificationReport.roadId} closure verified`,
      `${verificationReport.id} · Reason: ${reason}. Demo road state changed to confirmed closed.`,
      scenarioSteps[next].time,
    );
    setModal(null);
    notify(
      `${verificationReport.roadId} confirmed closed. Access and action queue updated.`,
    );
  }

  const matchedSettlements = settlements.filter((s) =>
    `${s.name} ${s.area} ${s.concern}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const matchedReports = allReports.filter(
    (r) =>
      `${r.id} ${r.text} ${r.source} ${r.settlementId}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (reportFilter === "All reports" ||
        (reportFilter === "Conflicts"
          ? r.kind === "conflict"
          : reportFilter === "Duplicates"
            ? r.kind === "duplicate"
            : r.kind === "blockage")),
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <Link
          className="brand"
          href="/"
          onClick={() => navigate("Overview")}
          aria-label="Aerolink home"
        >
          <span className="brand-mark">
            <Waypoints size={24} strokeWidth={1.8} />
          </span>
          <span>
            AERO<span className="brand-light">LiNK</span>
            <small>RESPONSE INTELLIGENCE</small>
          </span>
        </Link>
        <div className="workspace-select">
          <span className="workspace-icon">
            <Mountain size={18} />
          </span>
          <div>
            <strong>Wayanad district</strong>
            <small>Kerala, India</small>
          </div>
          <ChevronDown size={13} />
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav aria-label="Main navigation">
          {navItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => navigate(name)}
              className={view === name ? "nav-item active" : "nav-item"}
            >
              <Icon size={18} />
              <span>{name}</span>
              {name === "Field reports" && (
                <span className="nav-count">{allReports.length}</span>
              )}
              {name === "Action queue" && <i className="dot danger" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-card">
            <span className="demo-orbit">
              <Radio size={17} />
            </span>
            <strong>Built for preparedness.</strong>
            <p>Explore how evidence becomes coordinated action.</p>
            <button onClick={() => setModal("guide")}>
              Explore the demo <ArrowUpRight size={13} />
            </button>
          </div>
          <button
            className={`nav-item ${view === "Data sources" ? "active" : ""}`}
            onClick={() => navigate("Data sources")}
          >
            <Database size={17} />
            Data sources
          </button>
          <button className="nav-item" onClick={() => setModal("guide")}>
            <CircleHelp size={17} />
            Demo guide
          </button>
          <div className="operator">
            <span className="avatar">DC</span>
            <div>
              <strong>District coordinator</strong>
              <small>Demo workspace</small>
            </div>
            <span className="operator-dot" />
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button menu-button"
              aria-label="Toggle navigation"
              onClick={() => setMobileNav(!mobileNav)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{view}</strong>
          </div>
          <div className="topbar-right">
            <span className="simulation-pill">
              <i />
              SIMULATION MODE
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button notification-button"
              aria-label="Open action queue"
              onClick={() => navigate("Action queue")}
            >
              <Bell size={17} />
              <i />
            </button>
            <span className="avatar small">DC</span>
          </div>
        </header>
        <main id="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow heading-eyebrow">
                DISTRICT OPERATIONS / WAYANAD
              </div>
              <h1>{view === "Overview" ? "Situation overview" : view}</h1>
              <p>{subtitles[view]}</p>
            </div>
            <div className="heading-actions">
              <button className="button" onClick={exportBrief}>
                <ArrowDownToLine size={15} />
                Export brief
              </button>
              <button
                className="button button-primary"
                onClick={() => {
                  setPlaying(false);
                  setModal("report");
                }}
              >
                <Plus size={16} />
                New report
              </button>
            </div>
          </div>
          <div className="simulation-banner">
            <span className="banner-icon">
              <Radio size={16} />
            </span>
            <p>
              <strong>Preparedness scenario</strong>
              <span className="banner-separator">/</span>Rainfall-triggered
              landslides · Wayanad
              <span className="banner-muted">
                {" "}
                — All operational data is simulated.
              </span>
            </p>
            <button onClick={() => navigate("Data sources")}>
              View provenance
              <ArrowUpRight size={13} />
            </button>
          </div>

          {view === "Overview" && (
            <>
              <div className="metrics-grid">
                <Metric
                  icon={MapPin}
                  label="Settlements monitored"
                  value="06"
                  note="Within the demo area"
                  color="green"
                  bars={[22, 38, 30, 46, 38, 55, 44, 61]}
                />
                <Metric
                  icon={TriangleAlert}
                  label="High concern"
                  value="02"
                  note="Require coordinator review"
                  color="red"
                  bars={[15, 25, 22, 43, 39, 54, 62, 70]}
                />
                <Metric
                  icon={Route}
                  label="Access disruptions"
                  value={String(
                    roads.filter(
                      (r) =>
                        r.state.includes("blocked") ||
                        r.state.includes("closed"),
                    ).length,
                  ).padStart(2, "0")}
                  note={`${step >= 3 ? "1 settlement isolated" : "0 settlements isolated"} · demo graph`}
                  color="amber"
                  bars={[18, 18, 18, 34, 34, 50, 50, 50]}
                />
                <Metric
                  icon={Users}
                  label="Open response actions"
                  value={String(
                    actions.filter(
                      (a) => assignments[a.id] !== "Resolved in demo",
                    ).length,
                  ).padStart(2, "0")}
                  note="1 urgent medical request"
                  color="blue"
                  bars={[20, 36, 30, 48, 36, 55, 45, 63]}
                />
              </div>
              <div className="operational-grid">
                <section className="panel map-panel">
                  <div className="panel-header">
                    <div>
                      <h2>Operational picture</h2>
                      <span className="panel-subtitle">
                        Settlement concern & access corridors
                      </span>
                    </div>
                    <div className="map-header-actions">
                      <Badge>6 settlements</Badge>
                      <button
                        className={`icon-button ${showRoute ? "is-active" : ""}`}
                        aria-label="Toggle candidate route"
                        aria-pressed={showRoute}
                        onClick={() => setShowRoute(!showRoute)}
                      >
                        <Route size={17} />
                      </button>
                    </div>
                  </div>
                  <OperationsMap
                    selected={selected}
                    step={step}
                    onSelect={setSelected}
                    showRoute={showRoute}
                  />
                  <div className="map-footer">
                    <span>
                      <i className="live-dot" />
                      OpenStreetMap base layer
                    </span>
                    <span>
                      Overlays: simulated <InfoDot />
                    </span>
                  </div>
                </section>
                <SettlementDetail
                  settlement={settlement}
                  step={step}
                  onReports={() => {
                    navigate("Field reports");
                    setQuery(settlement.id);
                  }}
                  onRoute={() => setShowRoute(!showRoute)}
                  showRoute={showRoute}
                />
              </div>
              <div className="lower-grid">
                <ActionQueue
                  actions={actions}
                  compact
                  assignments={assignments}
                  onAssign={() => {}}
                  onSelect={selectSettlement}
                  onViewAll={() => navigate("Action queue")}
                />
                <section className="panel signals-panel">
                  <PanelHeader
                    title="Latest field signals"
                    eyebrow="EVIDENCE STREAM"
                    action="All reports"
                    onAction={() => navigate("Field reports")}
                  />
                  <div className="signals-list">
                    {allReports
                      .slice(-3)
                      .reverse()
                      .map((r) => (
                        <button
                          className="signal"
                          key={r.id}
                          onClick={() => {
                            navigate("Field reports");
                            setQuery(r.id);
                          }}
                        >
                          <span
                            className={`signal-icon ${r.kind === "medical" || r.kind === "conflict" ? "red" : "amber"}`}
                          >
                            {r.kind === "medical" ? (
                              <Plus size={16} />
                            ) : (
                              <Radio size={16} />
                            )}
                          </span>
                          <div>
                            <div className="signal-title">
                              <strong>{r.incident}</strong>
                              <span>{r.time}</span>
                            </div>
                            <p>{r.text}</p>
                            <span className="signal-meta">
                              {r.id} <i />
                              Simulated observation
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                  <div className="panel-footnote">
                    <ShieldCheck size={13} />
                    Evidence informs decisions. It does not replace
                    verification.
                  </div>
                </section>
              </div>
            </>
          )}

          {view === "Settlements" && (
            <section className="panel directory-panel">
              <div className="list-toolbar">
                <h2>
                  Settlement directory{" "}
                  <Badge>{matchedSettlements.length}</Badge>
                </h2>
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  placeholder="Search settlements…"
                />
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Settlement</th>
                      <th>Environmental concern</th>
                      <th>Evidence strength</th>
                      <th>Access assessment</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {matchedSettlements.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <strong>{s.name}</strong>
                          <small>{s.area}</small>
                        </td>
                        <td>
                          <Badge
                            tone={
                              s.concern === "High concern"
                                ? "red"
                                : s.concern === "Watch"
                                  ? "amber"
                                  : "green"
                            }
                          >
                            {s.concern}
                          </Badge>
                        </td>
                        <td>
                          <SupportBadge value={s.support} />
                        </td>
                        <td>{getAccess(s.id, step).label}</td>
                        <td>
                          <button
                            className="text-button"
                            onClick={() => selectSettlement(s.id)}
                          >
                            Inspect <ArrowUpRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!matchedSettlements.length && (
                  <p className="empty-inline">
                    No settlements match your search.
                  </p>
                )}
              </div>
              <div className="panel-footnote">
                Population: unknown for all demo settlements. Geography is
                approximate; all assessments are simulated.
              </div>
            </section>
          )}

          {view === "Field reports" && (
            <>
              <div className="list-toolbar report-toolbar">
                <div className="filter-pills">
                  {["All reports", "Blockages", "Conflicts", "Duplicates"].map(
                    (filter) => (
                      <button
                        key={filter}
                        className={reportFilter === filter ? "active" : ""}
                        onClick={() => setReportFilter(filter)}
                      >
                        {filter}
                      </button>
                    ),
                  )}
                </div>
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  placeholder="Search reports…"
                />
              </div>
              <ReportReview
                reports={matchedReports}
                step={step}
                reviewed={reviewed}
                onVerify={(report) => {
                  setPlaying(false);
                  setVerificationReport(report);
                  setModal("verify");
                }}
                onReview={(report) => {
                  setReviewed((old) => [...old, report.id]);
                  record(
                    "Report review recorded",
                    `${report.id} reviewed. ${report.kind === "conflict" ? "Conflict unresolved; road closure retained." : "No operational state changed."}`,
                  );
                  notify("Review recorded in activity log.");
                }}
              />
            </>
          )}

          {view === "Action queue" && (
            <ActionQueue
              actions={actions}
              assignments={assignments}
              onAssign={(id, value) => {
                setAssignments((previous) => ({ ...previous, [id]: value }));
                record(
                  "Action assignment updated",
                  `${id} → ${value}. Demonstration only; no dispatch sent.`,
                );
                notify("Demo assignment saved.");
              }}
              onSelect={selectSettlement}
              onViewAll={() => {}}
            />
          )}

          {view === "Activity log" && (
            <section className="panel activity-panel">
              <PanelHeader
                title="Decision & scenario history"
                eyebrow="AUDIT TRAIL"
              />
              <p className="activity-intro">
                Scenario events and coordinator actions for this session.
                Resetting the scenario preserves this log; refreshing the page
                clears it.
              </p>
              <div className="audit-list">
                {audit.map((entry) => (
                  <div className="audit-entry" key={entry.id}>
                    <span className="audit-icon">
                      <ShieldCheck size={16} />
                    </span>
                    <span className="mono">{entry.time}</span>
                    <div>
                      <h3>{entry.title}</h3>
                      <p>{entry.detail}</p>
                    </div>
                    <Badge>Simulated</Badge>
                  </div>
                ))}
                {scenarioSteps
                  .slice(0, step + 1)
                  .reverse()
                  .map((event, index) => (
                    <div className="audit-entry" key={event.time}>
                      <span className="audit-icon">
                        <Clock3 size={16} />
                      </span>
                      <span className="mono">{event.time}</span>
                      <div>
                        <h3>{event.title}</h3>
                        <p>{event.detail}</p>
                      </div>
                      <Badge>
                        {index === 0 ? "Current checkpoint" : "Scenario event"}
                      </Badge>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {view === "Data sources" && <DataSources />}
          <footer className="page-footer">
            <span>
              AEROLiNK <span> / </span> Decision support, grounded in evidence.
            </span>
            <span>
              UI prototype · v0.1 <i />
              Session-only data
            </span>
          </footer>
        </main>
        <div className="replay-bar">
          <div className="replay-label">
            <span className="replay-icon">
              <Clock3 size={18} />
            </span>
            <div>
              <strong>
                Scenario replay <Badge>SIMULATED</Badge>
              </strong>
              <small>10 JUN 2026 · IST / UTC+05:30</small>
            </div>
          </div>
          <div className="replay-controls">
            <button
              className="icon-button"
              aria-label="Reset scenario"
              onClick={() => {
                setPlaying(false);
                setModal("reset");
              }}
            >
              <RotateCcw size={16} />
            </button>
            <button
              className="play-button"
              aria-label={playing && step < 4 ? "Pause replay" : "Play replay"}
              disabled={step === 4}
              onClick={() => setPlaying(!playing)}
            >
              {playing && step < 4 ? (
                <Pause size={17} />
              ) : (
                <Play size={17} fill="currentColor" />
              )}
            </button>
            <button
              className="icon-button"
              aria-label="Advance scenario"
              disabled={step === 4}
              onClick={() => {
                setPlaying(false);
                changeStep(Math.min(4, step + 1));
              }}
            >
              <SkipForward size={17} />
            </button>
          </div>
          <div className="replay-track">
            <div className="timeline-line">
              <span style={{ width: `${step * 25}%` }} />
            </div>
            {scenarioSteps.map((s, i) => (
              <button
                key={s.time}
                aria-label={`Go to ${s.time}: ${s.title}`}
                className={i <= step ? "reached" : ""}
                onClick={() => {
                  setPlaying(false);
                  changeStep(i);
                }}
              >
                <i />
                <span>{s.time}</span>
              </button>
            ))}
          </div>
          <div className="scenario-clock">
            <strong>
              {current.time}
              <small> IST</small>
            </strong>
            <span>{step === 4 ? "Scenario complete" : current.title}</span>
          </div>
        </div>
      </div>
      {toast && (
        <div className="toast" role="status">
          <ShieldCheck size={17} />
          {toast}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <dialog
        ref={dialog}
        aria-label={
          modal === "report"
            ? "Add simulated field report"
            : modal === "verify"
              ? "Verify road closure"
              : modal === "reset"
                ? "Reset scenario"
                : "Demo guide"
        }
        onCancel={() => setModal(null)}
        onClose={() => setModal(null)}
        className="modal"
      >
        <button
          className="modal-close icon-button"
          aria-label="Close dialog"
          onClick={() => setModal(null)}
        >
          <X size={20} />
        </button>
        {modal === "report" && (
          <form onSubmit={submitReport}>
            <span className="eyebrow">FIELD INTAKE / SIMULATED</span>
            <h2>Add a field report</h2>
            <p className="modal-description">
              Preserve the original observation for coordinator review. This
              prototype does not run NLP or automatically change road states.
            </p>
            <label>
              Settlement
              <select name="settlement" defaultValue={selected}>
                {settlements.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Report type
              <select name="type">
                <option value="blockage">Field observation</option>
                <option value="medical">Medical / help request</option>
              </select>
            </label>
            <label>
              Original observation
              <textarea
                name="observation"
                required
                minLength={10}
                maxLength={1500}
                rows={4}
                placeholder="Describe what was observed and where…"
              />
            </label>
            <p className="micro-note">
              Demo only. Use fictional details. Refreshing clears session
              reports.
            </p>
            <button className="button button-primary full-width" type="submit">
              <Plus size={16} />
              Add simulated report
            </button>
          </form>
        )}
        {modal === "verify" && (
          <form onSubmit={verifyReport}>
            <span className="eyebrow">COORDINATOR VERIFICATION</span>
            <h2>Confirm {verificationReport?.roadId} closure</h2>
            <p className="modal-description">
              This applies the verified-closure checkpoint in the demo. The
              corridor will be excluded, and accessibility and response
              priorities will update.
            </p>
            <div className="info-note">
              <FileText size={17} />
              <span>
                {verificationReport?.id}: {verificationReport?.text}
              </span>
            </div>
            <label>
              Verification reason
              <textarea
                name="reason"
                required
                minLength={5}
                maxLength={500}
                rows={3}
                placeholder="e.g. Field responder confirmed no vehicle passage in this scenario."
              />
            </label>
            <button className="button button-primary full-width" type="submit">
              <ShieldCheck size={15} />
              Confirm closure & update scenario
            </button>
          </form>
        )}
        {modal === "reset" && (
          <>
            <span className="eyebrow">REPLAY CONTROLS</span>
            <h2>Restart the scenario?</h2>
            <p className="modal-description">
              Return to 14:00. Demo assignments, review marks, and manually
              entered reports will be cleared. The activity log is retained
              until refresh.
            </p>
            <button
              className="button button-primary full-width"
              onClick={() => {
                setStep(0);
                setPlaying(false);
                setAssignments({});
                setReviewed([]);
                setLocalReports([]);
                record(
                  "Scenario reset",
                  "Returned to 14:00. Session reports, assignments and review marks cleared.",
                  "14:00",
                );
                setModal(null);
                notify("Scenario restarted at 14:00.");
              }}
            >
              Reset to 14:00
            </button>
          </>
        )}
        {modal === "guide" && (
          <>
            <span className="eyebrow">AEROLINK / DEMO GUIDE</span>
            <h2>From signal to response.</h2>
            <p className="modal-description">
              A short walkthrough of the coordinator workflow. All operational
              observations are simulated.
            </p>
            <ol className="guide-steps">
              <li>
                <span>01</span>
                <div>
                  <strong>Understand the situation</strong>
                  <p>
                    Select Mundakkai on the map. Compare concern, evidence
                    support, and access.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Review the field evidence</strong>
                  <p>
                    Inspect FR-105 and its duplicate. Verify the closure and
                    enter a reason.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Watch accessibility change</strong>
                  <p>
                    Advance to 15:00. The last corridor becomes unavailable and
                    isolation is shown.
                  </p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <strong>Coordinate the next action</strong>
                  <p>
                    Inspect the medical-first action queue. Assign a demo team
                    and review the activity log.
                  </p>
                </div>
              </li>
            </ol>
            <div className="info-note">
              <BookOpen size={17} />
              <span>
                Map corridors are schematic. Rainfall is seeded, not historical
                or live. Advanced algorithms and the backend are future work.
              </span>
            </div>
            <button
              className="button button-primary full-width"
              onClick={() => setModal(null)}
            >
              Explore the workspace <ArrowRight size={16} />
            </button>
          </>
        )}
      </dialog>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  note,
  color,
  bars,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  note: string;
  color: string;
  bars: number[];
}) {
  return (
    <div className={`metric-card metric-${color}`}>
      <div className="metric-label">
        <span>{label}</span>
        <Icon size={17} />
      </div>
      <div className="metric-center">
        <strong>{value}</strong>
        <div className="spark-bars" aria-hidden="true">
          {bars.map((bar, i) => (
            <i key={i} style={{ height: `${bar}%` }} />
          ))}
        </div>
      </div>
      <p>
        <i className="dot" />
        {note}
      </p>
    </div>
  );
}
function InfoDot() {
  return (
    <span title="All scenario overlays are illustrative" className="info-dot">
      i
    </span>
  );
}
function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="search-box">
      <Search size={16} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          className="icon-button"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <X size={14} />
        </button>
      )}
    </label>
  );
}

function DataSources() {
  return (
    <div className="source-grid">
      <section className="panel source-card">
        <div className="source-icon">
          <Database size={22} />
        </div>
        <Badge tone="green">Connected base map</Badge>
        <h2>OpenStreetMap</h2>
        <p>
          Geographic background tiles requested from OpenStreetMap. Live tile
          delivery does not provide live road conditions.
        </p>
        <dl>
          <div>
            <dt>Coverage</dt>
            <dd>Wayanad viewport, Kerala</dd>
          </div>
          <div>
            <dt>Coordinates</dt>
            <dd>WGS84 input · Web Mercator display</dd>
          </div>
          <div>
            <dt>Updates</dt>
            <dd>Provider managed · not operational evidence</dd>
          </div>
          <div>
            <dt>Attribution / use</dt>
            <dd>
              © OpenStreetMap contributors · ODbL; tile usage policy applies
            </dd>
          </div>
        </dl>
        <a
          className="text-button"
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          Attribution & licence
          <ArrowUpRight size={14} />
        </a>
      </section>
      <section className="panel source-card">
        <div className="source-icon amber">
          <Radio size={22} />
        </div>
        <Badge tone="amber">Simulated</Badge>
        <h2>Preparedness scenario</h2>
        <p>
          Rainfall, concern states, evidence, help requests and schematic
          corridors are authored fixtures for demonstrating UI behavior.
        </p>
        <dl>
          <div>
            <dt>Scenario date</dt>
            <dd>10 June 2026 · 14:00–15:15 IST</dd>
          </div>
          <div>
            <dt>Geography</dt>
            <dd>Approximate named places, not verified boundaries</dd>
          </div>
          <div>
            <dt>Permitted use</dt>
            <dd>Project demonstration and development</dd>
          </div>
          <div>
            <dt>Limitations</dt>
            <dd>No operational validity or prediction claim</dd>
          </div>
        </dl>
        <span className="micro-note">
          No real personal or medical records are used.
        </span>
      </section>
      <section className="panel source-card">
        <div className="source-icon">
          <Mountain size={22} />
        </div>
        <Badge>Not connected</Badge>
        <h2>Environmental & terrain data</h2>
        <p>
          Open-Meteo historical/reanalysis rainfall and documented GSI
          susceptibility layers are planned integrations.
        </p>
        <dl>
          <div>
            <dt>Rainfall windows</dt>
            <dd>6 / 24 / 72 hours · currently seeded</dd>
          </div>
          <div>
            <dt>GSI layers</dt>
            <dd>No dataset imported or validated</dd>
          </div>
          <div>
            <dt>Source verification</dt>
            <dd>Coverage, licence, CRS and freshness pending</dd>
          </div>
          <div>
            <dt>Historical / live mode</dt>
            <dd>Unavailable in this milestone</dd>
          </div>
        </dl>
      </section>
      <section className="panel source-card">
        <div className="source-icon">
          <ShieldCheck size={22} />
        </div>
        <Badge>Scope boundary</Badge>
        <h2>What this prototype does</h2>
        <p>
          Connects the visual workflow from field evidence to road state,
          accessibility, and coordinator action using declared scenario
          checkpoints.
        </p>
        <dl>
          <div>
            <dt>Implemented</dt>
            <dd>
              Interactive UI, report review, replay, export, session audit
            </dd>
          </div>
          <div>
            <dt>Deferred</dt>
            <dd>FastAPI, SQLite, NLP, geospatial processing, real routing</dd>
          </div>
          <div>
            <dt>Unknown data</dt>
            <dd>Population, verified road geometry, actual terrain</dd>
          </div>
          <div>
            <dt>Persistence</dt>
            <dd>Session only · refreshing clears all changes</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
