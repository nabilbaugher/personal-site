// Single source of truth for the project-status section.
// Ledger + detail pages render from this. Long-form detail lives in
// /public/project_pages/<slug>.md so it can be edited (or regenerated) on its own.
//
// status: one of "active" | "writing" | "shipped" | "paused"
// Keeping data here (not hardcoded in JSX) is what makes the section cheap to
// keep current — eventually a scheduled job can rewrite this file from the repos.

export const PROJECTS = [
  {
    slug: "arc-agi-3",
    title: "ARC-AGI-3 — an autonomous world-model agent",
    status: "active",
    statusLabel: "Active · paused",
    period: "Jun 2026 — ongoing",
    updated: "Jun 16, 2026",
    tagline:
      "A 110+ hour autonomous research run building a game-conditioned world model for few-shot transfer on ARC-AGI-3, steered by periodic human course-corrections.",
    stats: [
      { n: "110+", l: "hrs autonomous" },
      { n: "25", l: "games probed" },
      { n: "330+", l: "experiments" },
      { n: "<$1k", l: "GPU spend" },
    ],
    latest:
      "E331 closeout — partial support for the goal-module hypotheses; joint gate not yet validated on a single seed. Held in a deliberate token-budget pause before the next variant.",
  },
  {
    slug: "trm",
    title: "TRM — what a recursive model's halting head learns",
    status: "writing",
    statusLabel: "Writing",
    period: "May — Jun 2026",
    updated: "Jun 2026",
    tagline:
      'Writing on model behavior, including what TRM\'s halting "Q" head actually rewards.',
    stats: [
      { n: "1", l: "TRM post" },
      { n: "+0.095", l: "AUC clean gap" },
      { n: "7M", l: "param model" },
    ],
    latest:
      'Drafted "What TRM\'s Halting Head Actually Learns": Q mostly rewards clean path structure over exact labels.',
  },
  {
    slug: "biobench",
    title: "BioBench — testing a model's grasp of cell-to-cell signaling",
    status: "shipped",
    statusLabel: "v3 shipped",
    period: "Apr — May 2026",
    updated: "May 2026",
    tagline:
      "A causally-grounded benchmark: does a cell-cascade model propagate ligand → receptor → pathway signals the way real biology does?",
    stats: [
      { n: "137", l: "test rows" },
      { n: "9", l: "pathways" },
      { n: "3", l: "source DBs" },
      { n: "4", l: "tightening rounds" },
    ],
    latest:
      "v3 row set finalized after four rounds of tightening; frontend and training-signal audit shipped.",
  },
];

export const STATUS_STYLES = {
  active: "text-[#4a6b46] border-[#b9cdb2] bg-[#eef3ea]",
  writing: "text-[#7d5e3f] border-[#d8c3a6] bg-[#f6efe3]",
  shipped: "text-[#4a5b6b] border-[#b2c1cd] bg-[#eaeff3]",
  paused: "text-[#8a7a5e] border-[#ddcfb0] bg-[#f5f0e3]",
};

export function getProject(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}
