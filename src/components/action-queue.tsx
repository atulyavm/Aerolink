"use client";

import { ArrowUpRight, CircleCheck, Clock3 } from "lucide-react";
import type { Action } from "@/lib/types";
import { settlements } from "@/lib/scenario";
import { Badge, PanelHeader, SupportBadge } from "./ui";

export function ActionQueue({
  actions,
  compact,
  assignments,
  onAssign,
  onSelect,
  onViewAll,
}: {
  actions: Action[];
  compact?: boolean;
  assignments: Record<string, string>;
  onAssign: (id: string, value: string) => void;
  onSelect: (id: string) => void;
  onViewAll: () => void;
}) {
  return (
    <section className={`panel action-panel ${compact ? "compact" : ""}`}>
      <PanelHeader
        title="Response priorities"
        eyebrow="ACTION QUEUE"
        action={compact ? "View all" : undefined}
        onAction={onViewAll}
      />
      <div className="queue-caption">
        <span>
          <i className="dot danger" />
          Life safety first
        </span>
        <span>Coordinator-led response</span>
      </div>
      <div className="action-list">
        {(compact ? actions.slice(0, 3) : actions).map((action, index) => (
          <article key={action.id} className="action-row">
            <span className={`action-rank ${action.priority.toLowerCase()}`}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="action-content">
              <div className="action-title">
                <h3>{action.title}</h3>
                <Badge
                  tone={
                    action.priority === "Urgent"
                      ? "red"
                      : action.priority === "High"
                        ? "amber"
                        : "neutral"
                  }
                >
                  {action.priority}
                </Badge>
              </div>
              <button
                className="settlement-link"
                onClick={() => onSelect(action.settlementId)}
              >
                {settlements.find((s) => s.id === action.settlementId)!.name}
                <ArrowUpRight size={11} />
              </button>
              <p>{action.reason}</p>
              <div className="action-meta">
                <SupportBadge value={action.support} />
                <span>{action.access}</span>
              </div>
            </div>
            {compact ? (
              <span className="queue-status">
                <Clock3 size={13} />
                {assignments[action.id] || "Unassigned"}
              </span>
            ) : (
              <label className="assign-label">
                Demo assignment
                <select
                  aria-label={`Assignment for ${action.id}`}
                  value={assignments[action.id] || "Unassigned"}
                  onChange={(e) => onAssign(action.id, e.target.value)}
                >
                  <option>Unassigned</option>
                  <option>Coordinator</option>
                  <option>Team Alpha · demo</option>
                  <option>Team Bravo · demo</option>
                  <option>Resolved in demo</option>
                </select>
              </label>
            )}
          </article>
        ))}
      </div>
      {!compact && (
        <div className="panel-footnote">
          <CircleCheck size={14} />
          Assignments are stored in this browser session only. No teams are
          dispatched.
        </div>
      )}
    </section>
  );
}
