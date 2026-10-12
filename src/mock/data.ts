// Mock data — isolated here so it can be replaced by the FastAPI backend.
import type {
  Analysis, AnalysisDetail, Category, Comparison, Hotspot, Project, Recommendation, Report, RuntimeSample, Severity,
} from "@/types";

let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const r = (min: number, max: number, d = 0) => +(min + rnd() * (max - min)).toFixed(d);

export const projects: Project[] = [
  { id: "p1", name: "inventory-service", language: "Java", description: "Spring Boot inventory microservice", lastAnalysis: "2026-10-10T14:22:00Z", efficiencyScore: 78, greenScore: 74, executionTimeMs: 1840, energyJ: 41.2, issues: 12, status: "completed" },
  { id: "p2", name: "data-pipeline-etl", language: "Python", description: "Pandas-based nightly ETL job", lastAnalysis: "2026-10-10T09:05:00Z", efficiencyScore: 61, greenScore: 58, executionTimeMs: 6420, energyJ: 132.8, issues: 27, status: "completed" },
  { id: "p3", name: "image-resizer", language: "Python", description: "Pillow batch image processing", lastAnalysis: "2026-10-09T18:41:00Z", efficiencyScore: 84, greenScore: 81, executionTimeMs: 920, energyJ: 18.6, issues: 6, status: "completed" },
  { id: "p4", name: "order-matching-engine", language: "Java", description: "In-memory order book matcher", lastAnalysis: "2026-10-11T07:58:00Z", efficiencyScore: 0, greenScore: 0, executionTimeMs: 0, energyJ: 0, issues: 0, status: "running" },
  { id: "p5", name: "ml-feature-store", language: "Python", description: "Feature computation service", lastAnalysis: "2026-10-08T11:13:00Z", efficiencyScore: 52, greenScore: 49, executionTimeMs: 9310, energyJ: 210.4, issues: 34, status: "failed" },
  { id: "p6", name: "pdf-report-generator", language: "Java", description: "iText report renderer", lastAnalysis: "2026-10-07T16:30:00Z", efficiencyScore: 71, greenScore: 69, executionTimeMs: 2210, energyJ: 52.3, issues: 15, status: "completed" },
];

const statuses = ["completed", "completed", "completed", "running", "completed", "failed"] as const;
export const analyses: Analysis[] = Array.from({ length: 14 }, (_, i) => {
  const p = projects[i % projects.length]!;
  const status = i === 3 ? "running" : i === 4 ? "failed" : statuses[i % 6] === "running" ? "completed" : statuses[i % 6]!;
  const eff = p.efficiencyScore || r(60, 85);
  const done = status === "completed";
  return {
    id: `AN-${(1042 - i).toString()}`,
    projectId: p.id, projectName: p.name, language: p.language,
    date: new Date(Date.UTC(2026, 9, 11 - Math.floor(i / 2), 14 - i, 10)).toISOString(),
    status,
    executionTimeMs: done ? Math.round((p.executionTimeMs || 3000) * r(0.85, 1.15, 2)) : 0,
    cpuPercent: done ? r(28, 86) : 0,
    memoryMb: done ? r(180, 1400) : 0,
    energyJ: done ? +((p.energyJ || 60) * r(0.85, 1.15, 2)).toFixed(1) : 0,
    efficiencyScore: done ? Math.min(98, Math.round(eff + r(-4, 4))) : 0,
    greenScore: done ? Math.min(98, Math.round((p.greenScore || eff) + r(-4, 4))) : 0,
    breakdown: { performance: r(55, 90), resource: r(50, 88), codeQuality: r(55, 92), energy: r(48, 86) },
    issues: done ? p.issues : 0,
    hardwareMeasured: i % 5 === 0,
  };
});

export const trend = Array.from({ length: 12 }, (_, i) => ({
  t: `W${i + 29}`,
  efficiency: 58 + i * 2 + r(-3, 3),
  green: 54 + i * 2 + r(-3, 3),
  executionMs: 4200 - i * 180 + r(-200, 200),
  cpu: 72 - i * 1.6 + r(-3, 3),
  memory: 860 - i * 22 + r(-30, 30),
  energy: 118 - i * 4.5 + r(-5, 5, 1),
}));

const files = ["service/repository.py", "etl/transform.py", "core/OrderBook.java", "util/JsonMapper.java", "img/resize.py", "api/Controller.java", "features/aggregate.py"];
const fns = ["load_all_rows", "merge_frames", "matchOrders", "serialize", "resize_batch", "handleRequest", "rolling_mean"];
const sev: Severity[] = ["critical", "high", "high", "medium", "medium", "low", "low"];

export const makeHotspots = (): Hotspot[] =>
  files.map((f, i) => ({
    id: `h${i}`, file: f, fn: fns[i]!, cpuPct: r(4, 38, 1), memoryMb: r(12, 420), timeMs: r(40, 1800), ioOps: r(0, 9000), energyJ: r(0.8, 22, 1), severity: sev[i]!,
  })).sort((a, b) => b.cpuPct - a.cpuPct);

const recTemplates: { category: Category; problem: string; metric: string; explanation: string; action: string; impact: string; priority: Severity }[] = [
  { category: "Performance", priority: "critical", problem: "N+1 query pattern in loop", metric: "Execution time 1.62 s (38% of total)", explanation: "A database query is issued for every element of the result set, causing repeated round trips.", action: "Batch the lookups into a single query using an IN clause or a join.", impact: "~30–40% lower execution time" },
  { category: "Memory", priority: "high", problem: "Entire dataset loaded into memory", metric: "Peak RSS 1.2 GB", explanation: "The full CSV is materialised as a DataFrame before filtering.", action: "Read in chunks (chunksize) and filter incrementally.", impact: "~60% lower peak memory" },
  { category: "CPU", priority: "high", problem: "Quadratic nested loop over orders", metric: "CPU 34% in matchOrders", explanation: "Each order is compared against all resting orders.", action: "Use a price-indexed TreeMap to restrict comparisons.", impact: "O(n²) → O(n log n)" },
  { category: "I/O", priority: "medium", problem: "Unbuffered file writes", metric: "8,912 write syscalls", explanation: "Small writes are flushed individually to disk.", action: "Wrap the stream in a BufferedWriter / use buffered I/O.", impact: "~90% fewer write syscalls" },
  { category: "Code Quality", priority: "medium", problem: "Duplicated serialization logic", metric: "Duplication 7.4%", explanation: "Three near-identical mapping blocks exist across modules.", action: "Extract a shared mapper utility.", impact: "Improved maintainability" },
  { category: "Complexity", priority: "medium", problem: "High cyclomatic complexity", metric: "Cyclomatic 24 in handleRequest", explanation: "Deeply nested conditionals increase branching cost and risk.", action: "Split into smaller handlers with early returns.", impact: "Complexity 24 → ~8" },
  { category: "Energy", priority: "low", problem: "Busy-wait polling loop", metric: "Est. 4.1 J idle consumption", explanation: "A sleep-less loop keeps a core active while waiting.", action: "Replace with blocking queue or event-driven wait.", impact: "~8% lower estimated energy" },
  { category: "Sustainability", priority: "low", problem: "Redundant recomputation of features", metric: "3 identical runs per job", explanation: "The same aggregates are recomputed for each consumer.", action: "Cache results with a TTL-based memoization.", impact: "~20% lower resource use" },
];

export const recommendations: Recommendation[] = analyses
  .filter((a) => a.status === "completed")
  .flatMap((a, ai) =>
    recTemplates.slice(0, 3 + (ai % 5)).map((t, i) => ({
      ...t,
      id: `R-${a.id.slice(3)}-${i}`, analysisId: a.id, projectId: a.projectId, projectName: a.projectName,
      target: `${files[(i + ai) % files.length]}::${fns[(i + ai) % fns.length]}`,
      status: (["open", "open", "in_progress", "resolved", "dismissed"] as const)[(i + ai) % 5]!,
    })),
  );

export const reports: Report[] = analyses
  .filter((a) => a.status === "completed")
  .map((a, i) => ({
    id: `RPT-${a.id.slice(3)}`, projectId: a.projectId, projectName: a.projectName, analysisId: a.id,
    date: a.date, efficiencyScore: a.efficiencyScore, greenScore: a.greenScore, status: i === 0 ? "draft" : "final",
  }));

export function makeDetail(a: Analysis): AnalysisDetail {
  const runtime: RuntimeSample[] = Array.from({ length: 40 }, (_, i) => ({
    t: i * 0.25, cpu: r(15, 95), ram: 200 + i * 12 + r(-20, 40), diskRead: r(0, 40, 1), diskWrite: r(0, 25, 1), netIn: r(0, 8, 1), netOut: r(0, 5, 1),
  }));
  const comparison: Comparison[] = [
    { metric: "Execution Time", unit: "ms", before: a.executionTimeMs, after: Math.round(a.executionTimeMs * 0.68), lowerIsBetter: true },
    { metric: "CPU", unit: "%", before: a.cpuPercent, after: Math.round(a.cpuPercent * 0.74), lowerIsBetter: true },
    { metric: "Memory", unit: "MB", before: a.memoryMb, after: Math.round(a.memoryMb * 0.61), lowerIsBetter: true },
    { metric: "Disk I/O", unit: "MB", before: 412, after: 188, lowerIsBetter: true },
    { metric: "Network I/O", unit: "MB", before: 36, after: 31, lowerIsBetter: true },
    { metric: "Energy (est.)", unit: "J", before: a.energyJ, after: +(a.energyJ * 0.7).toFixed(1), lowerIsBetter: true },
    { metric: "Efficiency Score", unit: "", before: a.efficiencyScore, after: Math.min(97, a.efficiencyScore + 12), lowerIsBetter: false },
    { metric: "Green Score", unit: "", before: a.greenScore, after: Math.min(97, a.greenScore + 14), lowerIsBetter: false },
  ];
  return {
    ...a,
    performanceTrend: trend.map((p) => ({ t: p.t, executionMs: p.executionMs, cpu: p.cpu })),
    runtime,
    processes: [
      { pid: 4121, name: a.language === "Java" ? "java" : "python3", threads: a.language === "Java" ? 24 : 4, peakRssMb: a.memoryMb, cpuTimeS: +(a.executionTimeMs / 1000 * 0.9).toFixed(2) },
      { pid: 4133, name: "worker-1", threads: 2, peakRssMb: Math.round(a.memoryMb * 0.2), cpuTimeS: 0.41 },
    ],
    quality: { bugs: r(0, 8), codeSmells: r(10, 60), vulnerabilities: r(0, 4), duplicationPct: r(1, 9, 1), maintainability: (["A", "B", "C"] as const)[r(0, 2)]!, cyclomatic: r(80, 240) },
    complexity: [
      { fn: "matchOrders", file: "core/OrderBook.java", time: "O(n²)", space: "O(n)", inputSize: [100, 500, 1000, 5000, 10000], runtimeMs: [2, 31, 118, 2870, 11400] },
      { fn: "merge_frames", file: "etl/transform.py", time: "O(n log n)", space: "O(n)", inputSize: [100, 500, 1000, 5000, 10000], runtimeMs: [1, 6, 13, 74, 160] },
      { fn: "serialize", file: "util/JsonMapper.java", time: "O(n)", space: "O(n)", inputSize: [100, 500, 1000, 5000, 10000], runtimeMs: [0.4, 2, 4, 21, 43] },
    ],
    energyTrend: trend.map((p) => ({ t: p.t, energy: p.energy })),
    hotspots: makeHotspots(),
    recommendations: recommendations.filter((x) => x.analysisId === a.id),
    comparison,
  };
}
