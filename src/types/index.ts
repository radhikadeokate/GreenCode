export type Language = "Python" | "Java";
export type RunStatus = "completed" | "running" | "failed" | "queued";
export type Severity = "critical" | "high" | "medium" | "low";
export type Category =
  | "Performance" | "CPU" | "Memory" | "I/O" | "Code Quality" | "Complexity" | "Energy" | "Sustainability";
export type RecStatus = "open" | "in_progress" | "resolved" | "dismissed";

export interface Project {
  id: string;
  name: string;
  language: Language;
  description: string;
  lastAnalysis: string;
  efficiencyScore: number;
  greenScore: number;
  executionTimeMs: number;
  energyJ: number;
  issues: number;
  status: RunStatus;
}

export interface ScoreBreakdown {
  performance: number;
  resource: number;
  codeQuality: number;
  energy: number;
}

export interface Analysis {
  id: string;
  projectId: string;
  projectName: string;
  language: Language;
  date: string;
  status: RunStatus;
  executionTimeMs: number;
  cpuPercent: number;
  memoryMb: number;
  energyJ: number;
  efficiencyScore: number;
  greenScore: number;
  breakdown: ScoreBreakdown;
  issues: number;
  hardwareMeasured: boolean;
}

export interface TimePoint { t: string; [k: string]: number | string }

export interface RuntimeSample { t: number; cpu: number; ram: number; diskRead: number; diskWrite: number; netIn: number; netOut: number }
export interface ProcessInfo { pid: number; name: string; threads: number; peakRssMb: number; cpuTimeS: number }

export interface CodeQuality {
  bugs: number; codeSmells: number; vulnerabilities: number; duplicationPct: number;
  maintainability: "A" | "B" | "C" | "D" | "E"; cyclomatic: number;
}

export interface ComplexityItem {
  fn: string; file: string; time: string; space: string; inputSize: number[]; runtimeMs: number[];
}

export interface Hotspot {
  id: string; file: string; fn: string; cpuPct: number; memoryMb: number; timeMs: number; ioOps: number; energyJ: number; severity: Severity;
}

export interface Recommendation {
  id: string; analysisId: string; projectId: string; projectName: string;
  priority: Severity; category: Category; problem: string; target: string; metric: string;
  explanation: string; action: string; impact: string; status: RecStatus;
}

export interface Comparison {
  metric: string; unit: string; before: number; after: number; lowerIsBetter: boolean;
}

export interface Report {
  id: string; projectId: string; projectName: string; analysisId: string; date: string;
  efficiencyScore: number; greenScore: number; status: "final" | "draft";
}

export interface AnalysisDetail extends Analysis {
  performanceTrend: TimePoint[];
  runtime: RuntimeSample[];
  processes: ProcessInfo[];
  quality: CodeQuality;
  complexity: ComplexityItem[];
  energyTrend: TimePoint[];
  hotspots: Hotspot[];
  recommendations: Recommendation[];
  comparison: Comparison[];
}

export interface CreateProjectInput {
  name: string; language: Language; description: string; entryPoint: string;
  runtimeArgs: string; iterations: number; timeoutS: number; fileName: string;
}
