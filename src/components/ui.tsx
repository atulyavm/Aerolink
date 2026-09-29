import type { ReactNode } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "red" | "amber" | "green" | "blue" | "neutral";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function SupportBadge({ value }: { value: string }) {
  return (
    <span className={`support ${value === "Strong support" ? "strong" : ""}`}>
      <ShieldCheck size={13} />
      {value}
    </span>
  );
}

export function PanelHeader({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="panel-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-button" onClick={onAction}>
          {action}
          <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
}
