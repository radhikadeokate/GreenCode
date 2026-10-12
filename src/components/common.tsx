import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { scoreTone } from "@/utils/format";
import type { RecStatus, RunStatus, Severity } from "@/types";

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, action, children, className }: { title?: string; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card shadow-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function Metric({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "success" | "info" | "warning" | "destructive" }) {
  const toneCls = { success: "text-success", info: "text-info", warning: "text-warning", destructive: "text-destructive" };
  return (
    <div className="rounded-lg border bg-card px-4 py-3.5 shadow-card transition-colors hover:border-foreground/20">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("num mt-1.5 text-2xl font-semibold tracking-tight", tone && toneCls[tone])}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const t = scoreTone(value);
  const bg = { success: "bg-success", info: "bg-info", warning: "bg-warning", destructive: "bg-destructive" }[t];
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">{label}</span><span className="num font-medium">{value}</span></div>
      <div className="h-1.5 rounded-full bg-muted"><div className={cn("h-full rounded-full", bg)} style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export function Score({ value }: { value: number }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  const t = scoreTone(value);
  const cls = { success: "text-success", info: "text-info", warning: "text-warning", destructive: "text-destructive" }[t];
  return <span className={cn("num font-semibold", cls)}>{value}</span>;
}

const pill = "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium capitalize border";
export function StatusBadge({ status }: { status: RunStatus | RecStatus | "final" | "draft" }) {
  const map: Record<string, string> = {
    completed: "bg-success/10 text-success border-success/20", final: "bg-success/10 text-success border-success/20", resolved: "bg-success/10 text-success border-success/20",
    running: "bg-info/10 text-info border-info/20", in_progress: "bg-info/10 text-info border-info/20",
    queued: "bg-muted text-muted-foreground border-border", draft: "bg-muted text-muted-foreground border-border", dismissed: "bg-muted text-muted-foreground border-border", open: "bg-warning/10 text-warning border-warning/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return <span className={cn(pill, map[status])}>{status === "running" && <span className="size-1.5 animate-pulse rounded-full bg-info" />}{status.replace("_", " ")}</span>;
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, string> = {
    critical: "bg-destructive/10 text-destructive border-destructive/20", high: "bg-warning/10 text-warning border-warning/20",
    medium: "bg-info/10 text-info border-info/20", low: "bg-muted text-muted-foreground border-border",
  };
  return <span className={cn(pill, map[severity])}>{severity}</span>;
}

export function EstimatedTag({ measured }: { measured?: boolean }) {
  return measured ? (
    <span className={cn(pill, "bg-success/10 text-success border-success/20 normal-case")}>Hardware-measured</span>
  ) : (
    <span className={cn(pill, "bg-warning/10 text-warning border-warning/20 normal-case")} title="Estimated from CPU/RAM/I-O utilisation models; no hardware power meter was used">Estimated</span>
  );
}

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">{head.map((h, i) => <th key={i} className="whitespace-nowrap px-3 py-2 font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y [&>tr]:transition-colors [&>tr:hover]:bg-muted/40">{children}</tbody>
      </table>
    </div>
  );
}
export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => <td className={cn("whitespace-nowrap px-3 py-2.5", className)}>{children}</td>;

export function Loading() {
  return <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>;
}

export const chartAxis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;
export const chartTooltip = { contentStyle: { background: "var(--popover)", color: "var(--popover-foreground)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, boxShadow: "var(--shadow-card)" }, labelStyle: { color: "var(--muted-foreground)", marginBottom: 4 }, itemStyle: { padding: 0 }, cursor: { fill: "var(--muted)", opacity: 0.5 } } as const;
